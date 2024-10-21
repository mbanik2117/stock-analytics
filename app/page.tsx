"use client";
import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface EquityDetails {
  info: {
    symbol: string;
    companyName: string;
    industry: string;
    activeSeries: string[];
    debtSeries: string[];
    isFNOSec: boolean;
    isCASec: boolean;
    isSLBSec: boolean;
    isDebtSec: boolean;
    isSuspended: boolean;
    tempSuspendedSeries: string[];
    isETFSec: boolean;
    isDelisted: boolean;
    isin: string;
    slb_isin: string;
    isMunicipalBond: boolean;
    isTop10: boolean;
    identifier: string;
  };
  metadata: {
    series: string;
    symbol: string;
    isin: string;
    status: string;
    listingDate: string;
    industry: string;
    lastUpdateTime: string;
    pdSectorPe: number;
    pdSymbolPe: number;
    pdSectorInd: string;
    pdSectorIndAll: string[];
  };
  securityInfo: {
    boardStatus: string;
    tradingStatus: string;
    tradingSegment: string;
    sessionNo: string;
    slb: string;
    classOfShare: string;
    derivatives: string;
    surveillance: {
      surv: null;
      desc: null;
    };
    faceValue: number;
    issuedSize: number;
  };
  sddDetails: {
    SDDAuditor: string;
    SDDStatus: string;
  };
  priceInfo: {
    lastPrice: number;
    change: number;
    pChange: number;
    previousClose: number;
    open: number;
    close: number;
    vwap: number;
    stockIndClosePrice: number;
    lowerCP: string;
    upperCP: string;
    pPriceBand: string;
    basePrice: number;
    intraDayHighLow: {
      min: number;
      max: number;
      value: number;
    };
    weekHighLow: {
      min: number;
      minDate: string;
      max: number;
      maxDate: string;
      value: number;
    };
    iNavValue: null;
    checkINAV: boolean;
    tickSize: number;
  };
  industryInfo: {
    macro: string;
    sector: string;
    industry: string;
    basicIndustry: string;
  };
  preOpenMarket: {
    preopen: {
      price: number;
      buyQty: number;
      sellQty: number;
      iep?: boolean;
    }[];
    ato: {
      buy: number;
      sell: number;
    };
    IEP: number;
    totalTradedVolume: number;
    finalPrice: number;
    finalQuantity: number;
    lastUpdateTime: string;
    totalBuyQuantity: number;
    totalSellQuantity: number;
    atoBuyQty: number;
    atoSellQty: number;
    Change: number;
    perChange: number;
    prevClose: number;
  };
}

interface TradeInfo {
  noBlockDeals: boolean;
  bulkBlockDeals: {
    name: string;
  }[];
  marketDeptOrderBook: {
    totalBuyQuantity: number;
    totalSellQuantity: number;
    bid: {
      price: number;
      quantity: number;
    }[];
    ask: {
      price: number;
      quantity: number;
    }[];
    tradeInfo: {
      totalTradedVolume: number;
      totalTradedValue: number;
      totalMarketCap: number;
      ffmc: number;
      impactCost: number;
      cmDailyVolatility: string;
      cmAnnualVolatility: string;
      marketLot: string;
      activeSeries: string;
    };
    valueAtRisk: {
      securityVar: number;
      indexVar: number;
      varMargin: number;
      extremeLossMargin: number;
      adhocMargin: number;
      applicableMargin: number;
    };
  };
  securityWiseDP: {
    quantityTraded: number;
    deliveryQuantity: number;
    deliveryToTradedQuantity: number;
    seriesRemarks: null;
    secWiseDelPosDate: string;
  };
}

interface CorporateInfo {
  latest_announcements: {
    data: {
      symbol: string;
      broadcastdate: string;
      subject: string;
    }[];
  };
  corporate_actions: {
    data: {
      symbol: string;
      exdate: string;
      purpose: string;
    }[];
  };
  shareholdings_patterns: {
    data: {
      "30-Sep-2023": {
        "Promoter & Promoter Group": string;
        Public: string;
        "Shares held by Employee Trusts": string;
        Total: string;
      }[];
      "31-Dec-2023": {
        "Promoter & Promoter Group": string;
        Public: string;
        "Shares held by Employee Trusts": string;
        Total: string;
      }[];
      "31-Mar-2024": {
        "Promoter & Promoter Group": string;
        Public: string;
        "Shares held by Employee Trusts": string;
        Total: string;
      }[];
      "30-Jun-2024": {
        "Promoter & Promoter Group": string;
        Public: string;
        "Shares held by Employee Trusts": string;
        Total: string;
      }[];
      "30-Sep-2024": {
        "Promoter & Promoter Group": string;
        Public: string;
        "Shares held by Employee Trusts": string;
        Total: string;
      }[];
    };
  };
  financial_results: {
    data: {
      from_date: string;
      to_date: string;
      expenditure: string;
      income: string;
      audited: string;
      cumulative: string;
      consolidated: string;
      reDilEPS: string;
      reProLossBefTax: string;
      proLossAftTax: string;
      re_broadcast_timestamp: string;
      xbrl_attachment: string;
      na_attachment: string;
    }[];
  };
  borad_meeting: {
    data: {
      symbol: string;
      purpose: string;
      meetingdate: string;
    }[];
  };
}

interface IntradayData {
  identifier: string;
  name: string;
  grapthData: [number, number][];
  closePrice: number;
}

interface OptionChainData {
  records: {
    expiryDates: string[];
    data: {
      strikePrice: number;
      expiryDate: string;
      CE: {
        strikePrice: number;
        expiryDate: string;
        underlying: string;
        identifier: string;
        openInterest: number;
        changeinOpenInterest: number;
        pchangeinOpenInterest: number;
        totalTradedVolume: number;
        impliedVolatility: number;
        lastPrice: number;
        change: number;
        pChange: number;
        totalBuyQuantity: number;
        totalSellQuantity: number;
        bidQty: number;
        bidprice: number;
        askQty: number;
        askPrice: number;
        underlyingValue: number;
      };
      PE: {
        strikePrice: number;
        expiryDate: string;
        underlying: string;
        identifier: string;
        openInterest: number;
        changeinOpenInterest: number;
        pchangeinOpenInterest: number;
        totalTradedVolume: number;
        impliedVolatility: number;
        lastPrice: number;
        change: number;
        pChange: number;
        totalBuyQuantity: number;
        totalSellQuantity: number;
        bidQty: number;
        bidprice: number;
        askQty: number;
        askPrice: number;
        underlyingValue: number;
      };
    }[];
    timestamp: string;
    underlyingValue: number;
    strikePrices: number[];
  };
  filtered: {
    data: {
      strikePrice: number;
      expiryDate: string;
      CE: {
        strikePrice: number;
        expiryDate: string;
        underlying: string;
        identifier: string;
        openInterest: number;
        changeinOpenInterest: number;
        pchangeinOpenInterest: number;
        totalTradedVolume: number;
        impliedVolatility: number;
        lastPrice: number;
        change: number;
        pChange: number;
        totalBuyQuantity: number;
        totalSellQuantity: number;
        bidQty: number;
        bidprice: number;
        askQty: number;
        askPrice: number;
        underlyingValue: number;
      };
      PE: {
        strikePrice: number;
        expiryDate: string;
        underlying: string;
        identifier: string;
        openInterest: number;
        changeinOpenInterest: number;
        pchangeinOpenInterest: number;
        totalTradedVolume: number;
        impliedVolatility: number;
        lastPrice: number;
        change: number;
        pChange: number;
        totalBuyQuantity: number;
        totalSellQuantity: number;
        bidQty: number;
        bidprice: number;
        askQty: number;
        askPrice: number;
        underlyingValue: number;
      };
    }[];
    CE: {
      totOI: number;
      totVol: number;
    };
    PE: {
      totOI: number;
      totVol: number;
    };
  };
}

interface StockData {
  symbol: string;
  equityDetails: EquityDetails;
  tradeInfo: TradeInfo;
  corporateInfo: CorporateInfo;
  intradayData: IntradayData;
  optionChainData: OptionChainData;
}

const Page: React.FC = () => {
  const [inputSymbol, setInputSymbol] = useState('');
  const [symbols, setSymbols] = useState<string[]>([]);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputSymbol(event.target.value);
  };

  const handleAddSymbol = () => {
    const newSymbol = inputSymbol.trim().toUpperCase();
    if (newSymbol && !symbols.includes(newSymbol)) {
      setSymbols([...symbols, newSymbol]);
      setInputSymbol('');
    }
  };

  useEffect(() => {
    const socketConnection = io('http://localhost:3000', {
      path: '/api/socket',
      timeout: 10000,
    });
  
    setSocket(socketConnection);
  
    socketConnection.on('connect', () => {
      console.log('Connected to the WebSocket server');
    });
  
    socketConnection.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
  
    socketConnection.on('stockData', (data: StockData[]) => {
      setStockData((prevData) => {
        const updatedData = [...prevData];
        data.forEach((newData) => {
          if (newData.symbol) {
            const index = updatedData.findIndex(
              (item) => item.symbol === newData.symbol
            );
            if (index !== -1) {
              updatedData[index] = newData;
            } else {
              updatedData.push(newData);
            }
          }
        });
        return updatedData;
      });
    });
  
    return () => {
      socketConnection.disconnect();
    };
  }, []);
  
  useEffect(() => {
    if (socket && symbols.length > 0) {
      socket.emit("subscribeToSymbols", symbols);
    }
  }, [symbols, socket]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-extrabold mb-6 text-blue-700">Stock Dashboard (Real-Time)</h1>
      <div className="mb-6 flex items-center space-x-2">
        <input
          type="text"
          value={inputSymbol}
          onChange={handleInputChange}
          placeholder="Enter stock symbol"
          className="border p-3 flex-1 rounded-lg shadow-md border-gray-400"
        />
        <button
          onClick={handleAddSymbol}
          className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Add Symbol
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {stockData.map((data, index) => {
          const priceChangeClass =
            data.equityDetails.priceInfo.change > 0
              ? 'text-green-600'
              : 'text-red-600';

          return (
            <div key={index} className="p-6 bg-white rounded-xl shadow-xl border border-gray-300">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                {data.equityDetails.info.symbol} -{' '}
                <span className="text-gray-600">
                  {data.equityDetails.info.companyName}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-black font-bold">
                <div className="border rounded-lg shadow-lg p-4 bg-blue-50 flex flex-col">
                  <h3 className="text-xl font-semibold text-blue-500 mb-2">Price Info</h3>
                  <p className="text-lg">Last Price: <span className="font-bold text-gray-800">{data.equityDetails.priceInfo.lastPrice.toFixed(2)}</span></p>
                  <p className={`text-lg font-bold ${priceChangeClass}`}>Change: {data.equityDetails.priceInfo.change.toFixed(2)} ({data.equityDetails.priceInfo.pChange.toFixed(2)}%)</p>
                  <p>Open: {data.equityDetails.priceInfo.open}</p>
                  <p>Previous Close: {data.intradayData.closePrice}</p>
                  <p>High: {data.equityDetails.priceInfo.intraDayHighLow.max}</p>
                  <p>Low: {data.equityDetails.priceInfo.intraDayHighLow.min}</p>
                </div>

                <div className="border rounded-lg shadow-lg p-4 bg-yellow-50 flex flex-col text-black font-bold">
                  <h3 className="text-xl font-semibold text-yellow-500 mb-2">Equity Details</h3>
                  <p>Industry: {data.equityDetails.info.industry}</p>
                  <p>ISIN: {data.equityDetails.info.isin}</p>
                  <p>Sector PE: {data.equityDetails.metadata.pdSectorPe}</p>
                  <p>Symbol PE: {data.equityDetails.metadata.pdSymbolPe}</p>
                  <p>Active Series: {data.equityDetails.info.activeSeries.join(', ')}</p>
                  <p>Last Updated: {data.equityDetails.metadata.lastUpdateTime}</p>
                </div>

                <div className="border rounded-lg shadow-lg p-4 bg-purple-50 flex flex-col">
                  <h3 className="text-xl font-semibold text-purple-500 mb-2">Trade Info</h3>
                  <p>Total Traded Value: {data.tradeInfo.marketDeptOrderBook.tradeInfo.totalTradedValue}</p>
                  <p>Total Market Cap: {data.tradeInfo.marketDeptOrderBook.tradeInfo.totalMarketCap}</p>
                  <p>Quantity Traded: {data.tradeInfo.securityWiseDP.quantityTraded}</p>
                  <p>Delivery Quantity: {data.tradeInfo.securityWiseDP.deliveryQuantity}</p>
                  <p>Delivery to Traded Quantity: {data.tradeInfo.securityWiseDP.deliveryToTradedQuantity}</p>
                  <p>Total Buy Quantity: {data.tradeInfo.marketDeptOrderBook.totalBuyQuantity}</p>
                  <p>Total Sell Quantity: {data.tradeInfo.marketDeptOrderBook.totalSellQuantity}</p>
                </div>

                <div className="border rounded-lg shadow-lg p-4 bg-red-50 flex flex-col text-black font-bold">
                  <h3 className="text-xl font-semibold text-red-500 mb-2">Corporate Info</h3>
                  <h4 className="text-lg font-semibold mb-2">Announcements</h4>
                  {data.corporateInfo.latest_announcements.data.map((announcement, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      {announcement.broadcastdate}: {announcement.subject}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Page;