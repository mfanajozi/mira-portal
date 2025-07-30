import { Pool } from '@neondatabase/serverless';

// Create pool only if DATABASE_URL is available
const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

// Helper function to check database connection
function checkDatabaseConnection() {
  if (!pool) {
    throw new Error('Database connection not configured. Please set DATABASE_URL environment variable.');
  }
  return pool;
}

export interface Message {
  id: string;
  message: string;
  address?: string;
  location?: any;
  date_reported: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assigned_to?: string;
  notes?: string;
}

export interface Audio {
  id: string;
  audio_url: string;
  address?: string;
  location?: any;
  date_reported: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assigned_to?: string;
  notes?: string;
}

export interface Image {
  id: string;
  image_url: string;
  address?: string;
  location?: any;
  date_reported: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assigned_to?: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_status?: string;
  new_status?: string;
  notes?: string;
  changed_by: string;
  changed_at: string;
}

export class DatabaseService {
  static async getMessages(): Promise<Message[]> {
    const activePool = checkDatabaseConnection();
    const client = await activePool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM messages ORDER BY date_reported DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Database error in getMessages:', error);
      return [];
    } finally {
      client.release();
    }
  }

  static async getAudio(): Promise<Audio[]> {
    const activePool = checkDatabaseConnection();
    const client = await activePool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM audio ORDER BY date_reported DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Database error in getAudio:', error);
      return [];
    } finally {
      client.release();
    }
  }

  static async getImages(): Promise<Image[]> {
    const activePool = checkDatabaseConnection();
    const client = await activePool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM images ORDER BY date_reported DESC'
      );
      return result.rows;
    } catch (error) {
      console.error('Database error in getImages:', error);
      return [];
    } finally {
      client.release();
    }
  }

  static async updateStatus(
    table: 'messages' | 'audio' | 'images',
    id: string,
    status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
    notes?: string,
    userId?: string
  ): Promise<void> {
    const activePool = checkDatabaseConnection();
    const client = await activePool.connect();
    
    // Validate the table name to prevent SQL injection
    if (!['messages', 'audio', 'images'].includes(table)) {
      throw new Error('Invalid table name');
    }

    try {
      await client.query('BEGIN');

      // Get current status for logging using a prepared statement
      const selectQuery = `SELECT status FROM ${table} WHERE id = $1`;
      const currentResult = await client.query(selectQuery, [id]);
      
      if (!currentResult.rows[0]) {
        throw new Error(`Record not found in ${table} table`);
      }
      
      const oldStatus = currentResult.rows[0].status;

      // Update the record
      const updateQuery = `UPDATE ${table} SET status = $1::report_status, notes = COALESCE($2, notes), assigned_to = COALESCE($3, assigned_to) WHERE id = $4`;
      const updateResult = await client.query(updateQuery, [status, notes, userId, id]);
      
      if (updateResult.rowCount === 0) {
        throw new Error('Record not found');
      }

      // Log the activity
      await client.query(
        'INSERT INTO activity_logs (table_name, record_id, action, old_status, new_status, notes, changed_by, changed_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())',
        [table, id, 'status_update', oldStatus, status, notes, userId || 'system']
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database error in updateStatus:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getStats() {
    const activePool = checkDatabaseConnection();
    const client = await activePool.connect();
    try {
      const [messagesResult, audioResult, imagesResult, openQueriesResult] = await Promise.all([
        client.query(`
          SELECT COUNT(*) as total 
          FROM messages 
          WHERE date_reported >= NOW() - INTERVAL '90 days'
        `),
        client.query(`
          SELECT COUNT(*) as total 
          FROM audio 
          WHERE date_reported >= NOW() - INTERVAL '90 days'
        `),
        client.query(`
          SELECT COUNT(*) as total 
          FROM images 
          WHERE date_reported >= NOW() - INTERVAL '90 days'
        `),
        client.query(`
          SELECT 
            (SELECT COUNT(*) FROM messages WHERE status = 'NEW') +
            (SELECT COUNT(*) FROM audio WHERE status = 'NEW') +
            (SELECT COUNT(*) FROM images WHERE status = 'NEW') as total
        `)
      ]);

      return {
        totalMessages: parseInt(messagesResult.rows[0].total),
        totalAudio: parseInt(audioResult.rows[0].total),
        totalImages: parseInt(imagesResult.rows[0].total),
        openQueries: parseInt(openQueriesResult.rows[0].total)
      };
    } catch (error) {
      console.error('Database error in getStats:', error);
      return {
        totalMessages: 0,
        totalAudio: 0,
        totalImages: 0,
        openQueries: 0
      };
    } finally {
      client.release();
    }
  }
}