export default function NotificationBell({ notifications = [] }) { return <button type="button" aria-label={`${notifications.length} notifications`}>🔔 {notifications.length}</button>; }
