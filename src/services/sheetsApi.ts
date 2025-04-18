
import axios from 'axios';

const API_KEY = 'AIzaSyDvJ23IolKwjdxAnTv7l8DwLuwGRZ_tIR8';
const SPREADSHEET_ID = '1rctu_xg4P0KkMWKbzu7-mgJp-HjCu-cT8DZqNAzln-s';

interface SheetData {
  article: string;
  content: string;
}

export const fetchSheetData = async (sheetName: string): Promise<SheetData[]> => {
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}!A:B?key=${API_KEY}`
    );

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      return [];
    }

    // Skip the header row if it exists and map the data
    const startIndex = rows[0][0] === 'Artigo' && rows[0][1] === 'Conteúdo' ? 1 : 0;
    
    return rows.slice(startIndex).map((row: any) => {
      return {
        article: row[0] || '',
        content: row[1] || ''
      };
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw new Error('Falha ao carregar dados da planilha');
  }
};

export const fetchAvailableSheets = async (): Promise<string[]> => {
  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`
    );
    
    return response.data.sheets.map((sheet: any) => sheet.properties.title);
  } catch (error) {
    console.error('Error fetching available sheets:', error);
    throw new Error('Falha ao carregar lista de legislações');
  }
};

export const searchArticle = async (
  sheetName: string, 
  articleNumber: string
): Promise<SheetData | null> => {
  try {
    const data = await fetchSheetData(sheetName);
    return data.find(item => item.article === articleNumber) || null;
  } catch (error) {
    console.error('Error searching article:', error);
    throw new Error('Falha ao buscar artigo');
  }
};

export const searchByTerm = async (
  sheetName: string,
  searchTerm: string
): Promise<SheetData[]> => {
  try {
    const data = await fetchSheetData(sheetName);
    const term = searchTerm.toLowerCase();
    
    return data.filter(item => 
      item.content.toLowerCase().includes(term) || 
      item.article.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error searching by term:', error);
    throw new Error('Falha ao buscar termo');
  }
};
