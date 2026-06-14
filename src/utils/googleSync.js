/**
 * Google Sync REST Utilities for Sweet Swing
 * Uses standard fetch calls to communicate directly with Google Drive and Google Sheets APIs
 * from the client side using the user's OAuth access token.
 */

// Search user's Google Drive for the logbook spreadsheet
export async function searchLogbookFile(token) {
  const query = encodeURIComponent("name = 'Sweet Swing Logbook' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to search Drive: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files && data.files.length > 0 ? data.files[0] : null;
}

// Create a new Sweet Swing Logbook spreadsheet in the user's Google Drive
export async function createLogbookFile(token) {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';

  const body = {
    properties: {
      title: 'Sweet Swing Logbook'
    },
    sheets: [
      {
        properties: {
          title: 'Sessions'
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Session ID' } },
                  { userEnteredValue: { stringValue: 'Date' } },
                  { userEnteredValue: { stringValue: 'Start Time' } },
                  { userEnteredValue: { stringValue: 'End Time' } },
                  { userEnteredValue: { stringValue: 'Notes' } },
                  { userEnteredValue: { stringValue: 'Rating' } },
                  { userEnteredValue: { stringValue: 'Shots JSON' } }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Failed to create spreadsheet: ${response.statusText}`);
  }

  const data = await response.json();
  return data.spreadsheetId;
}

// Fetch all sessions from the Google Sheet
export async function fetchSessionsFromSheet(token, spreadsheetId) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sessions!A2:G9999`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch spreadsheet rows: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.values) {
    return [];
  }

  return data.values.map(row => {
    try {
      return {
        id: Number(row[0]),
        date: row[1] || '',
        startTime: row[2] || '',
        endTime: row[3] || '',
        notes: row[4] || '',
        rating: Number(row[5] || 4),
        shots: row[6] ? JSON.parse(row[6]) : []
      };
    } catch (e) {
      console.error('Failed to parse spreadsheet row:', row, e);
      return null;
    }
  }).filter(Boolean);
}

// Append a single new session to the Google Sheet
export async function appendSessionToSheet(token, spreadsheetId, session) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sessions!A:G:append?valueInputOption=USER_ENTERED`;

  const body = {
    range: 'Sessions!A:G',
    majorDimension: 'ROWS',
    values: [
      [
        session.id.toString(),
        session.date || '',
        session.startTime || '',
        session.endTime || '',
        session.notes || '',
        session.rating.toString(),
        JSON.stringify(session.shots || [])
      ]
    ]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Failed to append session row: ${response.statusText}`);
  }
}

// Clear spreadsheet values (excluding header)
export async function clearSheetValues(token, spreadsheetId) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sessions!A2:G9999:clear`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to clear sheet values: ${response.statusText}`);
  }
}

// Overwrite all session rows in the Google Sheet (used for deletes and full syncs)
export async function overwriteSessionsInSheet(token, spreadsheetId, sessions) {
  // First clear any existing data below the headers
  await clearSheetValues(token, spreadsheetId);

  if (sessions.length === 0) return;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sessions!A2:G9999?valueInputOption=USER_ENTERED`;

  const body = {
    range: 'Sessions!A2:G9999',
    majorDimension: 'ROWS',
    values: sessions.map(session => [
      session.id.toString(),
      session.date || '',
      session.startTime || '',
      session.endTime || '',
      session.notes || '',
      session.rating.toString(),
      JSON.stringify(session.shots || [])
    ])
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Failed to overwrite sheet rows: ${response.statusText}`);
  }
}
