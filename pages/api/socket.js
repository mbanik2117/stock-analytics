import { Server } from 'socket.io';
import NseIndia from '../../utils/nse'; // Import the NSE utility

const nse = new NseIndia();

// Socket.IO API route handler
const SocketHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...');

    // Initialize Socket.IO
    const io = new Server(res.socket.server, {
      path: '/api/socket', // This should match the client path
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Save io instance to avoid multiple initializations
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('subscribeToSymbols', async (symbols) => {
        console.log('Subscribed to symbols:', symbols);

        const fetchStockData = async () => {
          const stockDataPromises = symbols.map(async (symbol) => {
            try {
              const equityDetails = await nse.getEquityDetails(symbol);
              const tradeInfo = await nse.getEquityTradeInfo(symbol);
              const corporateInfo = await nse.getEquityCorporateInfo(symbol);
              const intradayData = await nse.getEquityIntradayData(symbol);
              
              return {
                symbol,
                equityDetails,
                tradeInfo,
                corporateInfo,
                intradayData,
              };
            } catch (error) {
              console.error(`Error fetching data for symbol: ${symbol}`, error);
              return null;
            }
          });

          const stockData = await Promise.all(stockDataPromises);
          socket.emit('stockData', stockData.filter((data) => data !== null));
        };

        const intervalId = setInterval(fetchStockData, 5000);

        socket.on('disconnect', () => {
          console.log('User disconnected:', socket.id);
          clearInterval(intervalId);
        });
      });
    });
  }

  res.end();
};

export default SocketHandler;
