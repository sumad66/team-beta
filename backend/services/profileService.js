const pool = require('../config/database');

class ProfileService {
  static async saveProfile(userId, profile) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO profiles (user_id, profile_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE profile_data = ?',
        [userId, JSON.stringify(profile), JSON.stringify(profile)]
      );
      return result;
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  static async getProfile(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT profile_data FROM profiles WHERE user_id = ?',
        [userId]
      );
      return rows.length > 0 ? JSON.parse(rows[0].profile_data) : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  static async deleteProfile(userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM profiles WHERE user_id = ?',
        [userId]
      );
      return result;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }
}

module.exports = ProfileService; 