// api/notifications/send.js
import { sendScheduledNotifications } from '../../../src/services/notification.service.js';

export const config = {
    schedule: '0 * * * *', // runs every hour — minimal granularity on Vercel
};

export default async function handler(req, res) {
    try {
        await sendScheduledNotifications();
        res.status(200)
            .json({
                success: true,
                message: 'Notifications processed.'
            });
    } catch (error) {
        console.error("Notification error:", error);
        res.status(500)
            .json({
                success: false,
                message: 'Error sending notifications.'
            });
    }
}
