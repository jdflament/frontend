import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "@xstyled/styled-components";
import TradeSidebar from "./TradeSidebar/TradeSidebar";
import TradeMarketSelector from "./TradeMarketSelector/TradeMarketSelector";
import TradeTables from "./TradeTables/TradeTables";
import TradeFooter from "./TradeFooter/TradeFooter";
import TradeChartArea from "./TradeChartArea/TradeChartArea";
import TradeBooks from "./TradeBooks/TradeBooks";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import {
  networkSelector,
  userOrdersSelector,
  userFillsSelector,
  marketFillsSelector,
  lastPricesSelector,
  marketSummarySelector,
  liquiditySelector,
  currentMarketSelector,
  marketInfoSelector,
  setCurrentMarket,
  resetData,
  layoutSelector,
} from "lib/store/features/api/apiSlice";
import { userSelector } from "lib/store/features/auth/authSlice";
import api from "lib/api";
import { useLocation, useHistory } from "react-router-dom";
import {
  getChainIdFromMarketChain,
  marketQueryParam,
  networkQueryParam,
} from "../../pages/ListPairPage/SuccessModal";

const TradeContainer = styled.div`
  color: #aeaebf;
  height: calc(100vh - 48px);
  background: ${(p) => p.theme.colors.zzLightBorder};
`;

const TradeGrid = styled.article`
  display: grid;
  grid-template-rows: 50px 4fr 3fr 50px;
  grid-template-columns: ${(props) => {
    let layout = undefined;
    switch (props.layout) {
        case 1:
          layout = "325px 1fr 300px";
          break;
        case 2:
          layout = "300px 1fr 325px";
          break;
        case 3:
          layout = "1fr 300px 325px";
          break;
        default:
          layout = "325px 300px 1fr";
          break;
      }
      return (layout);
     } };
    
  grid-template-areas:
    "marketSelector marketSelector marketSelector"
    ${(props) => {
      let layout = undefined;
      switch (props.layout) {
        case 1:
          layout = `
          "sidebar chart books"
          "sidebar tables books"
          "sidebar footer footer"
          `;          
          break;
        case 2:
          layout = `
          "books chart sidebar"
          "books tables sidebar"
          "footer footer sidebar"
          `;          
          break;
        case 3:          
          layout = `
          "chart books sidebar"
          "tables books sidebar"
          "footer footer sidebar"
          `;          
          break;
        default:
          layout = `
          "sidebar books chart"
          "sidebar books tables"
          "sidebar footer footer"
          `;
          break;
      }
      return (layout);
     } };
  min-height: calc(100vh - 48px);
  gap: 1px;

  @media screen and (max-width: 991px) {
    grid-template-rows: 50px 300px auto 2fr 2fr 50px;
    grid-template-columns: 100%;
    grid-template-areas:
      "marketSelector"
      "chart"
      "sidebar"
      "books"
      "tables"
      "footer";
  }

  > div,
  > aside,
  > header,
  > footer,
  > section,
  > main {
    background: ${(p) => p.theme.colors.zzDarkest};
  }
`;

export function TradeDashboard() {
  const user = useSelector(userSelector);
  const network = useSelector(networkSelector);
  const currentMarket = useSelector(currentMarketSelector);
  const userOrders = useSelector(userOrdersSelector);
  const userFills = useSelector(userFillsSelector);
  const marketFills = useSelector(marketFillsSelector);
  const lastPrices = useSelector(lastPricesSelector);
  const marketSummary = useSelector(marketSummarySelector);
  const liquidity = useSelector(liquiditySelector);
  const layout = useSelector(layoutSelector);
  const marketInfo = useSelector(marketInfoSelector);
  const dispatch = useDispatch();
  const lastPriceTableData = [];
  const markets = [];

  const { search } = useLocation();
  const history = useHistory();

  const updateMarketChain = (market) => {
    dispatch(setCurrentMarket(market));
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const marketFromURL = urlParams.get(marketQueryParam);
    const networkFromURL = urlParams.get(networkQueryParam);
    const chainid = getChainIdFromMarketChain(networkFromURL);
    if (marketFromURL && currentMarket !== marketFromURL) {
      updateMarketChain(marketFromURL);
    }
    if (chainid && network !== chainid) {
      api.setAPIProvider(chainid);
      api.signOut();
    }
  }, []);

  // Update URL when market or network update
  useEffect(() => {
    let networkText;
    if (network === 1) {
      networkText = "zksync";
    } else if (network === 1000) {
      networkText = "zksync-rinkeby";
    }
    history.push(`/?market=${currentMarket}&network=${networkText}`);
  }, [network, currentMarket]);

  useEffect(() => {
    if(user.address && !user.id){
      console.log('here')
      history.push("/bridge");
      toast.error(
        "Your zkSync account is not activated. Please use the bridge to deposit funds into zkSync and activate your zkSync wallet.",
        {
          autoClose: 60000
        }
      );
    }
    const sub = () => {
      dispatch(resetData());
      api.subscribeToMarket(currentMarket);
    };

    if (api.ws && api.ws.readyState === 0) {
      api.on("open", sub);
    } else {
      sub();
    }

    return () => {
      if (api.ws && api.ws.readyState !== 0) {
        api.unsubscribeToMarket(currentMarket);
      } else {
        api.off("open", sub);
      }
    };
  }, [network, currentMarket, api.ws]);

  Object.keys(lastPrices).forEach((market) => {
    markets.push(market);
    const price = lastPrices[market].price;
    const change = lastPrices[market].change;
    const pctchange = ((change / price) * 100).toFixed(2);
    const quoteCurrency = market.split("-")[1];
    const quoteCurrencyUSDC = quoteCurrency + "-USDC";
    let quoteCurrencyPrice = 0;
    if (quoteCurrency === "USDC" || quoteCurrency === "USDT") {
      quoteCurrencyPrice = 1;
    }
    if (lastPrices[quoteCurrencyUSDC]) {
      quoteCurrencyPrice = lastPrices[quoteCurrencyUSDC].price;
    }
    let usdVolume = 0;
    usdVolume = lastPrices[market].quoteVolume * quoteCurrencyPrice;
    lastPriceTableData.push({
      td1: market,
      td2: price,
      td3: pctchange,
      usdVolume,
    });
  });
  lastPriceTableData.sort((a, b) => b.usdVolume - a.usdVolume);

  const orderbookBids = [];
  const orderbookAsks = [];

  // Only display recent trades
  // There's a bunch of user trades in this list that are too old to display
  const fillData = [];
  const maxFillId = Math.max(...Object.values(marketFills).map((f) => f[1]));
  Object.values(marketFills)
    .filter((fill) => fill[1] > maxFillId - 500 && fill[6] !== "r")
    .sort((a, b) => b[1] - a[1])
    .forEach((fill) => {
      fillData.push({
        td1: Number(fill[4]),
        td2: Number(fill[5]),
        td3: Number(fill[4] * fill[5]),
        side: fill[3],
      });
    });
  
  liquidity.forEach((liq) => {
    const side = liq[0];
    const price = liq[1];
    const quantity = liq[2];
    if (side === "b") {
      orderbookBids.push({
        td1: price,
        td2: quantity,
        td3: price * quantity,
        side: "b",
      });
    }
    if (side === "s") {
      orderbookAsks.push({
        td1: price,
        td2: quantity,
        td3: price * quantity,
        side: "s",
      });
    }
  });

  orderbookAsks.sort((a, b) => b.td1 - a.td1);
  orderbookBids.sort((a, b) => b.td1 - a.td1);

  const askBins = [];
  for (let i = 0; i < orderbookAsks.length; i++) {
    const lastAskIndex = askBins.length - 1;
    if (i === 0) {
      askBins.push(orderbookAsks[i]);
    } else if (
      orderbookAsks[i].td1.toPrecision(6) ===
      askBins[lastAskIndex].td1.toPrecision(6)
    ) {
      askBins[lastAskIndex].td2 += orderbookAsks[i].td2;
      askBins[lastAskIndex].td3 += orderbookAsks[i].td3;
    } else {
      askBins.push(orderbookAsks[i]);
    }
  }

  const bidBins = [];
  for (let i in orderbookBids) {
    const lastBidIndex = bidBins.length - 1;
    if (i === "0") {
      bidBins.push(orderbookBids[i]);
    } else if (
      orderbookBids[i].td1.toPrecision(6) ===
      bidBins[lastBidIndex].td1.toPrecision(6)
    ) {
      bidBins[lastBidIndex].td2 += orderbookBids[i].td2;
      bidBins[lastBidIndex].td3 += orderbookBids[i].td3;
    } else {
      bidBins.push(orderbookBids[i]);
    }
  }

  const activeOrderStatuses = ["o", "m", "b"];
  const activeUserOrders = Object.values(userOrders).filter((order) =>
    activeOrderStatuses.includes(order[9])
  ).length;

  return (
    <TradeContainer>
      <TradeGrid layout={layout}>
        <TradeMarketSelector
          updateMarketChain={updateMarketChain}
          marketSummary={marketSummary}
          markets={markets}
          currentMarket={currentMarket}
          marketInfo={marketInfo}
        />
        {/* TradePriceBtcTable, Spotbox */}
        <TradeSidebar
          lastPriceTableData={lastPriceTableData}
          updateMarketChain={updateMarketChain}
          markets={markets}
          currentMarket={currentMarket}
          lastPrice={marketSummary.price}
          user={user}
          activeOrderCount={activeUserOrders}
          liquidity={liquidity}
          marketInfo={marketInfo}
          marketSummary={marketSummary}
        />
        {/* TradePriceTable, TradePriceHeadSecond */}
        <TradeBooks
          currentMarket={currentMarket}
          priceTableData={askBins}
          lastPrice={marketSummary.price}
          marketInfo={marketInfo}
          bidBins={bidBins}
        />
        {/* TradeChartArea */}
        <TradeChartArea marketInfo={marketInfo} />
        {/* OrdersTable */}
        <TradeTables
          userFills={userFills}
          userOrders={userOrders}
          user={user}
          marketInfo={marketInfo}
        />
        <TradeFooter />
      </TradeGrid>
    </TradeContainer>
  );
}
