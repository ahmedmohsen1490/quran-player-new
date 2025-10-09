const DB_NAME = 'ronaq-db';
const DB_VERSION = 4; // Incremented version
const AUDIO_STORE_NAME = 'ayahs';
const TAFSIR_STORE_NAME = 'tafsir';
const TEXT_STORE_NAME = 'quranText';

let db: IDBDatabase;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBRequest).error);
      reject('IndexedDB error: ' + (event.target as IDBRequest).error);
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      
      // Migration from older versions: remove 'kidsAudio' store if it exists
      if (event.oldVersion < 4 && dbInstance.objectStoreNames.contains('kidsAudio')) {
          dbInstance.deleteObjectStore('kidsAudio');
      }

      if (!dbInstance.objectStoreNames.contains(AUDIO_STORE_NAME)) {
        dbInstance.createObjectStore(AUDIO_STORE_NAME, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(TAFSIR_STORE_NAME)) {
        dbInstance.createObjectStore(TAFSIR_STORE_NAME, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(TEXT_STORE_NAME)) {
        dbInstance.createObjectStore(TEXT_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const addAyah = async (reciterId: string, surahId: number, ayahNum: number, audioBlob: Blob): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([AUDIO_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(AUDIO_STORE_NAME);
    const id = `${reciterId}-${surahId}-${ayahNum}`;
    const request = store.put({ id, audioBlob });

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
        console.error('Failed to add ayah:', (event.target as IDBRequest).error);
        reject('Failed to add ayah: ' + (event.target as IDBRequest).error);
    };
  });
};

export const getAyah = async (reciterId: string, surahId: number, ayahNum: number): Promise<Blob | null> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([AUDIO_STORE_NAME], 'readonly');
        const store = transaction.objectStore(AUDIO_STORE_NAME);
        const id = `${reciterId}-${surahId}-${ayahNum}`;
        const request = store.get(id);

        request.onsuccess = (event) => {
            const result = (event.target as IDBRequest).result;
            resolve(result ? result.audioBlob : null);
        };
        request.onerror = (event) => {
            console.error('Failed to get ayah:', (event.target as IDBRequest).error);
            reject('Failed to get ayah: ' + (event.target as IDBRequest).error);
        };
    });
};

export const addTafsir = async (surahId: number, ayahInSurah: number, text: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TAFSIR_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(TAFSIR_STORE_NAME);
        const id = `${surahId}:${ayahInSurah}`;
        const request = store.put({ id, text });

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
            console.error('Failed to add tafsir:', (event.target as IDBRequest).error);
            reject('Failed to add tafsir: ' + (event.target as IDBRequest).error);
        };
    });
};

export const getTafsir = async (surahId: number, ayahInSurah: number): Promise<string | null> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TAFSIR_STORE_NAME], 'readonly');
        const store = transaction.objectStore(TAFSIR_STORE_NAME);
        const id = `${surahId}:${ayahInSurah}`;
        const request = store.get(id);

        request.onsuccess = (event) => {
            const result = (event.target as IDBRequest).result;
            resolve(result ? result.text : null);
        };
        request.onerror = (event) => {
            console.error('Failed to get tafsir:', (event.target as IDBRequest).error);
            reject('Failed to get tafsir: ' + (event.target as IDBRequest).error);
        };
    });
};

export const getAllDownloadedKeys = async (storeName: 'ayahs' | 'tafsir' | 'quranText'): Promise<string[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAllKeys();

        request.onsuccess = (event) => {
            const allKeys = (event.target as IDBRequest).result as (string[] | IDBValidKey[]);
            resolve(allKeys as string[]);
        };
        request.onerror = (event) => {
            console.error('Failed to get keys:', (event.target as IDBRequest).error);
            reject('Failed to get keys: ' + (event.target as IDBRequest).error);
        };
    });
};

export const deleteSurahAudio = async (reciterId: string, surahId: number): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([AUDIO_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(AUDIO_STORE_NAME);
    const prefix = `${reciterId}-${surahId}-`;
    const range = IDBKeyRange.bound(prefix, prefix + '\uffff');
    const request = store.delete(range);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Failed to delete surah audio:', (event.target as IDBRequest).error);
      reject('Failed to delete surah audio: ' + (event.target as IDBRequest).error);
    };
  });
};

export const deleteTafsirsForSurah = async (surahId: number): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([TAFSIR_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(TAFSIR_STORE_NAME);
    const prefix = `${surahId}:`;
    const range = IDBKeyRange.bound(prefix, prefix + '\uffff');
    const request = store.delete(range);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Failed to delete tafsirs for surah:', (event.target as IDBRequest).error);
      reject('Failed to delete tafsirs for surah: ' + (event.target as IDBRequest).error);
    };
  });
};

export const getDownloadedTafsirCountForSurah = async (surahId: number): Promise<number> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TAFSIR_STORE_NAME], 'readonly');
        const store = transaction.objectStore(TAFSIR_STORE_NAME);
        const prefix = `${surahId}:`;
        const range = IDBKeyRange.bound(prefix, prefix + '\uffff');
        const request = store.count(range);

        request.onsuccess = (event) => {
            resolve((event.target as IDBRequest).result);
        };
        request.onerror = (event) => {
            console.error('Failed to count tafsirs for surah:', (event.target as IDBRequest).error);
            reject('Failed to count tafsirs for surah: ' + (event.target as IDBRequest).error);
        };
    });
};

// Functions for Reading Quran Text
export const addSurahText = async (surahId: number, ayahs: any[]): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TEXT_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(TEXT_STORE_NAME);
        const request = store.put({ id: surahId, ayahs });

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject('Failed to add surah text: ' + (event.target as IDBRequest).error);
    });
};

export const getSurahText = async (surahId: number): Promise<any[] | null> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TEXT_STORE_NAME], 'readonly');
        const store = transaction.objectStore(TEXT_STORE_NAME);
        const request = store.get(surahId);

        request.onsuccess = (event) => {
            const result = (event.target as IDBRequest).result;
            resolve(result ? result.ayahs : null);
        };
        request.onerror = (event) => reject('Failed to get surah text: ' + (event.target as IDBRequest).error);
    });
};

export const deleteSurahText = async (surahId: number): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TEXT_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(TEXT_STORE_NAME);
        const request = store.delete(surahId);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject('Failed to delete surah text: ' + (event.target as IDBRequest).error);
    });
};