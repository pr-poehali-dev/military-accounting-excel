"""
Business: API для управления военнослужащими, движениями и медосмотрами
Args: event - HTTP запрос с методом, телом и параметрами
Returns: JSON с данными или статистикой
"""
import json
import os
from datetime import datetime, date
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters') or {}
    path_params = event.get('pathParams') or {}
    action = query_params.get('action', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        
        if method == 'GET' and action == 'stats':
            return get_stats(conn)
        elif method == 'GET' and action == 'personnel_detail':
            personnel_id = int(query_params.get('id', 0))
            return get_personnel_detail(conn, personnel_id)
        elif method == 'GET' and action == 'personnel':
            return get_personnel_list(conn, query_params)
        elif method == 'POST' and action == 'create_personnel':
            body = json.loads(event.get('body', '{}'))
            return create_personnel(conn, body)
        elif method == 'PUT' and action == 'update_personnel':
            personnel_id = int(query_params.get('id', 0))
            body = json.loads(event.get('body', '{}'))
            return update_personnel(conn, personnel_id, body)
        elif method == 'POST' and action == 'add_movement':
            body = json.loads(event.get('body', '{}'))
            return add_movement(conn, body)
        elif method == 'POST' and action == 'add_medical_visit':
            body = json.loads(event.get('body', '{}'))
            return add_medical_visit(conn, body)
        elif method == 'GET' and action == 'export':
            return export_to_excel(conn, query_params)
        else:
            return error_response(404, 'Unknown action')
            
    except Exception as e:
        return error_response(500, str(e))
    finally:
        if conn:
            conn.close()

def get_stats(conn) -> Dict[str, Any]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            UPDATE personnel 
            SET days_in_current_status = EXTRACT(DAY FROM (NOW() - status_changed_at))::INTEGER
            WHERE status_changed_at IS NOT NULL
        """)
        
        cur.execute("""
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE current_status = 'в_пвд') as v_pvd,
                COUNT(*) FILTER (WHERE current_status = 'в_строю') as v_stroyu,
                COUNT(*) FILTER (WHERE current_status = 'госпитализация') as gospitalizaciya,
                COUNT(*) FILTER (WHERE current_status = 'отпуск') as otpusk,
                COUNT(*) FILTER (WHERE current_status = 'убыл') as ubyl,
                COUNT(*) FILTER (WHERE current_status = 'ввк') as vvk,
                COUNT(*) FILTER (WHERE current_status = 'амбулаторное_лечение') as ambulatory,
                COUNT(*) FILTER (WHERE current_status = 'увольнение') as uvolnenie
            FROM personnel
        """)
        stats = cur.fetchone()
        
        cur.execute("""
            SELECT COUNT(*) as count
            FROM personnel
            WHERE current_status = 'госпитализация' 
            AND days_in_current_status > 30
        """)
        hosp_alert = cur.fetchone()['count']
        
        cur.execute("""
            SELECT COUNT(*) as count
            FROM personnel
            WHERE current_status = 'в_пвд' 
            AND days_in_current_status > 30
        """)
        pvd_alert = cur.fetchone()['count']
        
        cur.execute("""
            SELECT COUNT(*) as count
            FROM movements m
            JOIN personnel p ON p.id = m.personnel_id
            WHERE m.movement_type = 'отпуск'
            AND m.expected_return_date < CURRENT_DATE
            AND p.current_status = 'отпуск'
        """)
        leave_alert = cur.fetchone()['count']
        
        conn.commit()
        
    return success_response({
        'total': stats['total'],
        'v_pvd': stats['v_pvd'],
        'v_stroyu': stats['v_stroyu'],
        'gospitalizaciya': stats['gospitalizaciya'],
        'otpusk': stats['otpusk'],
        'ubyl': stats['ubyl'],
        'vvk': stats['vvk'],
        'ambulatory': stats['ambulatory'],
        'uvolnenie': stats['uvolnenie'],
        'alerts': {
            'hosp_over_30': hosp_alert,
            'pvd_over_30': pvd_alert,
            'leave_overdue': leave_alert
        }
    })

def get_personnel_list(conn, query_params: Dict) -> Dict[str, Any]:
    search = query_params.get('search', '')
    unit = query_params.get('unit', '')
    status = query_params.get('status', '')
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        query = "SELECT * FROM personnel WHERE 1=1"
        params = []
        
        if search:
            query += " AND (full_name ILIKE %s OR personal_number ILIKE %s)"
            search_pattern = f"%{search}%"
            params.extend([search_pattern, search_pattern])
        
        if unit:
            query += " AND unit = %s"
            params.append(unit)
            
        if status:
            query += " AND current_status = %s"
            params.append(status)
        
        query += " ORDER BY created_at DESC"
        
        cur.execute(query, params)
        personnel = cur.fetchall()
        
        cur.execute("SELECT DISTINCT unit FROM personnel WHERE unit IS NOT NULL ORDER BY unit")
        units = [row['unit'] for row in cur.fetchall()]
        
    return success_response({
        'personnel': [dict(p) for p in personnel],
        'units': units
    })

def get_personnel_detail(conn, personnel_id: int) -> Dict[str, Any]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM personnel WHERE id = %s", (personnel_id,))
        person = cur.fetchone()
        
        if not person:
            return error_response(404, 'Personnel not found')
        
        cur.execute("""
            SELECT * FROM movements 
            WHERE personnel_id = %s 
            ORDER BY start_date DESC
        """, (personnel_id,))
        movements = cur.fetchall()
        
        cur.execute("""
            SELECT * FROM medical_visits 
            WHERE personnel_id = %s 
            ORDER BY visit_date DESC
        """, (personnel_id,))
        medical_visits = cur.fetchall()
        
    return success_response({
        'personnel': dict(person),
        'movements': [dict(m) for m in movements],
        'medical_visits': [dict(v) for v in medical_visits]
    })

def create_personnel(conn, data: Dict) -> Dict[str, Any]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            INSERT INTO personnel 
            (personal_number, full_name, rank, unit, phone, current_status, fitness_category, fitness_category_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            data['personal_number'],
            data['full_name'],
            data.get('rank'),
            data.get('unit'),
            data.get('phone'),
            data.get('current_status', 'в_пвд'),
            data.get('fitness_category'),
            data.get('fitness_category_date')
        ))
        personnel = cur.fetchone()
        conn.commit()
        
    return success_response(dict(personnel))

def update_personnel(conn, personnel_id: int, data: Dict) -> Dict[str, Any]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            UPDATE personnel 
            SET full_name = %s, rank = %s, unit = %s, phone = %s,
                current_status = %s, fitness_category = %s, 
                fitness_category_date = %s, updated_at = NOW()
            WHERE id = %s
            RETURNING *
        """, (
            data['full_name'],
            data.get('rank'),
            data.get('unit'),
            data.get('phone'),
            data.get('current_status'),
            data.get('fitness_category'),
            data.get('fitness_category_date'),
            personnel_id
        ))
        personnel = cur.fetchone()
        conn.commit()
        
    return success_response(dict(personnel))

def add_movement(conn, data: Dict) -> Dict[str, Any]:
    from datetime import datetime, timedelta
    
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        expected_return = None
        if data['movement_type'] == 'отпуск' and data.get('leave_days'):
            start = datetime.strptime(data['start_date'], '%Y-%m-%d')
            expected_return = (start + timedelta(days=int(data['leave_days']))).strftime('%Y-%m-%d')
        
        cur.execute("""
            INSERT INTO movements 
            (personnel_id, movement_type, start_date, end_date, destination, notes, vmo, leave_days, expected_return_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            data['personnel_id'],
            data['movement_type'],
            data['start_date'],
            data.get('end_date'),
            data.get('destination'),
            data.get('notes'),
            data.get('vmo'),
            data.get('leave_days'),
            expected_return
        ))
        movement = cur.fetchone()
        
        status_update_types = ['госпитализация', 'отпуск', 'убыл', 'ввк', 'амбулаторное_лечение', 'увольнение', 'в_строй', 'прибыл']
        if data['movement_type'] in status_update_types:
            new_status = data['movement_type']
            if data['movement_type'] == 'в_строй':
                new_status = 'в_строю'
            elif data['movement_type'] == 'прибыл':
                new_status = 'в_пвд'
            elif data['movement_type'] == 'ввк':
                new_status = 'ввк'
            elif data['movement_type'] == 'амбулаторное_лечение':
                new_status = 'амбулаторное_лечение'
            elif data['movement_type'] == 'увольнение':
                new_status = 'увольнение'
                
            cur.execute("""
                UPDATE personnel 
                SET current_status = %s, status_changed_at = NOW(), days_in_current_status = 0, updated_at = NOW()
                WHERE id = %s
            """, (new_status, data['personnel_id']))
        
        conn.commit()
        
    return success_response(dict(movement))

def add_medical_visit(conn, data: Dict) -> Dict[str, Any]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            INSERT INTO medical_visits 
            (personnel_id, visit_date, doctor_specialty, diagnosis, recommendations)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
        """, (
            data['personnel_id'],
            data['visit_date'],
            data['doctor_specialty'],
            data.get('diagnosis'),
            data.get('recommendations')
        ))
        visit = cur.fetchone()
        
        if data.get('fitness_category'):
            cur.execute("""
                UPDATE personnel 
                SET fitness_category = %s, fitness_category_date = %s, updated_at = NOW()
                WHERE id = %s
            """, (data['fitness_category'], data['visit_date'], data['personnel_id']))
        
        conn.commit()
        
    return success_response(dict(visit))

def export_to_excel(conn, query_params: Dict) -> Dict[str, Any]:
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM personnel ORDER BY unit, full_name")
        personnel = cur.fetchall()
        
    return success_response({
        'data': [dict(p) for p in personnel],
        'message': 'Export data ready'
    })

def success_response(data: Any) -> Dict[str, Any]:
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps(data, default=str)
    }

def error_response(code: int, message: str) -> Dict[str, Any]:
    return {
        'statusCode': code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': message})
    }