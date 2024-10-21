import NseIndia from '../../utils/nse'; // Use ES6 import syntax
// Initialize NSE instance
const nse = new NseIndia();

// Handler for `/api/stock/symbols`
export default async function handler(req, res) {
  const { method, query } = req;

  switch (method) {
    // Fetch all stock symbols
    case 'GET': {
      if (query.symbol) {
        return getStockDetails(req, res); // If the request has a symbol, call the details endpoint
      } else {
        return getAllStockSymbols(req, res); // If no symbol is provided, fetch all symbols
      }
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Fetch all stock symbols
async function getAllStockSymbols(req, res) {
  try {
    const symbols = await nse.getAllStockSymbols();
    return res.status(200).json({ symbols });
  } catch (error) {
    console.error('Error fetching stock symbols:', error);
    return res.status(500).json({ error: 'Failed to fetch stock symbols' });
  }
}

// Fetch equity details for a specific symbol
async function getStockDetails(req, res) {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Stock symbol is required' });
  }

  try {
    const equityDetails = await nse.getEquityDetails(symbol);
    const tradeInfo = await nse.getEquityTradeInfo(symbol);
    const corporateInfo = await nse.getEquityCorporateInfo(symbol);
    const intradayData = await nse.getEquityIntradayData(symbol);
    const optionChainData = await nse.getEquityOptionChain(symbol);

    return res.status(200).json({
      equityDetails,
      tradeInfo,
      corporateInfo,
      intradayData,
      optionChainData,
    });
  } catch (error) {
    console.error(`Error fetching data for symbol: ${symbol}`, error);
    return res.status(500).json({ error: `Failed to fetch data for symbol: ${symbol}` });
  }
}
