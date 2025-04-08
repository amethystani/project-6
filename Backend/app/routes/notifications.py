from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Notification, NotificationType
from datetime import datetime

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    current_user = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=current_user).order_by(Notification.created_at.desc()).all()
    return jsonify([{
        'id': n.id,
        'title': n.title,
        'message': n.message,
        'created_at': n.created_at.isoformat(),
        'read': n.is_read,
        'type': n.type.value,
        'link': n.link
    } for n in notifications])

@notifications_bp.route('/notifications/unread', methods=['GET'])
@jwt_required()
def get_unread_notifications():
    current_user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=current_user_id, is_read=False).order_by(Notification.created_at.desc()).all()
    return jsonify([notification.to_dict() for notification in notifications])

@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    current_user = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user).first_or_404()
    notification.is_read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read'})

@notifications_bp.route('/mark-all-read', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    current_user = get_jwt_identity()
    Notification.query.filter_by(user_id=current_user, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'})

@notifications_bp.route('/notifications', methods=['POST'])
@jwt_required()
def create_notification():
    data = request.get_json()
    notification = Notification(
        user_id=data['user_id'],
        title=data['title'],
        message=data['message'],
        type=data['type'],
        link=data.get('link')
    )
    db.session.add(notification)
    db.session.commit()
    return jsonify(notification.to_dict()), 201

@notifications_bp.route('/notifications/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    current_user_id = get_jwt_identity()
    count = Notification.query.filter_by(user_id=current_user_id, is_read=False).count()
    return jsonify({'unread_count': count})

@notifications_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    current_user_id = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()
    
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404
        
    db.session.delete(notification)
    db.session.commit()
    
    return jsonify({'message': 'Notification deleted successfully'}) 