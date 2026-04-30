import { getCloudantClient } from '@/core/db/cloudant';
import { HistoryEvent } from '@/core/types';

const DB_NAME = 'classroom_history';

async function ensureDbExists() {
  const client = getCloudantClient();
  try {
    await client.getDatabaseInformation({ db: DB_NAME });
  } catch (error: any) {
    if (error.status === 404) {
      await client.putDatabase({ db: DB_NAME });
    } else {
      throw error;
    }
  }
}

export async function saveHistoryEvent(event: HistoryEvent) {
  await ensureDbExists();
  const client = getCloudantClient();
  
  await client.postDocument({
    db: DB_NAME,
    document: {
      _id: event.id,
      ...event,
      createdAt: new Date().toISOString()
    }
  });
}

export async function getHistoryEvents(videoId?: string): Promise<HistoryEvent[]> {
  try {
    const client = getCloudantClient();
    const response = await client.postFind({
      db: DB_NAME,
      selector: videoId ? { videoId: { "$eq": videoId } } : {}
    });
    
    const events = response.result.docs.filter(Boolean) as any[];
    
    return events.map(doc => {
      const { _id, _rev, createdAt, ...rest } = doc;
      return { id: _id, ...rest } as HistoryEvent;
    }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error: any) {
    if (error.status === 404) {
      return [];
    }
    console.error('Error fetching history:', error);
    return [];
  }
}

export async function getPastSessions(): Promise<string[]> {
  try {
    const client = getCloudantClient();
    // Fetch limited docs to find unique videoIds (assuming reasonable volume)
    const response = await client.postFind({
      db: DB_NAME,
      selector: {},
      fields: ["videoId"],
      limit: 1000
    });
    
    const events = response.result.docs.filter(Boolean) as any[];
    const sessions = new Set<string>();
    
    for (const event of events) {
      if (event.videoId) {
        sessions.add(event.videoId);
      }
    }
    
    return Array.from(sessions);
  } catch (error: any) {
    if (error.status === 404) {
      return []; // DB might not exist yet
    }
    console.error('Error fetching past sessions:', error);
    return [];
  }
}
