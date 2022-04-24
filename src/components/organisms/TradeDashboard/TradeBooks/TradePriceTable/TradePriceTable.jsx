import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import useTheme from "components/hooks/useTheme";
import { marketInfoSelector, currentMarketSelector } from "lib/store/features/api/apiSlice";
import { numStringToSymbol } from "lib/utils";
import Text from "components/atoms/Text/Text";

const Table = styled.table`
  display: flex;
  flex: auto;
  overflow: auto;
  height: 194px;
  padding: 0px;
  flex-direction: column;
  justify-content: space-between;

  tbody {
    width: 100%;
    display: table;
    background-position: top right;
    background-size: 70% 100%;
    background-repeat: no-repeat;
    margin-top: 0;
  }
  
  thead {
    position: sticky;
    top: 0;
    display: table;
    width: 100%;
  }
  
  th {
    text-transform: uppercase;
    padding: 6px;
  }

  th:nth-child(1), td:nth-child(1) {
    width: 30%;
    text-align: start;
    padding-left: 0px;
  }

  th:nth-child(2), td:nth-child(2) {
    width: 40%;
    text-align: center;
  }

  th:nth-child(3), td:nth-child(3) {
    width: 30%;
    text-align: right;
    white-space: nowrap;
    padding-right: 0px;
  }
  
  @media screen and (min-width: 1800px) {
    width: 100%;
  }
  
  @media screen and (max-width: 991px) {
    width: 100%;
  }
  
  ::-webkit-scrollbar {
    width: 5px;
    position: relative;
    z-index: 20;
  }
  
  ::-webkit-scrollbar-track {
    border-radius: 0px;
    background: hsla(0, 0%, 100%, 0.15);
    height: 23px;
  }
  
  ::-webkit-scrollbar-thumb {
    border-radius: 0px;
    background: hsla(0, 0%, 100%, 0.4);
  }
  
  ::-webkit-scrollbar-thumb:window-inactive {
    background: #fff;
  }
`

const TradePriceTable = (props) => {
  const { theme } = useTheme()
  const marketInfo = useSelector(marketInfoSelector);
  const currentMarket = useSelector(currentMarketSelector)
  const ref = useRef(null)

  const scrollToBottom = () => {
    if (props.scrollToBottom) {
      ref.current.scrollTo(0, ref.current.scrollHeight)
    }
  };

  useEffect(() => {
    setTimeout(() => scrollToBottom(), 1000)
  }, [currentMarket]);

  let total_total = 0;
  props.priceTableData.map((d) => total_total += d.td2);
  let total_step = (props.className === "trade_table_asks")
    ? total_total
    : 0

  let onClickRow;
  if (props.onClickRow) onClickRow = props.onClickRow;
  else onClickRow = () => null;

  return (
    <Table ref={ref}>
      {props.head && (
        <thead>
          <tr>
            <th><Text font="tableHeader" color="foregroundLowEmphasis">Price</Text></th>
            <th><Text font="tableHeader" color="foregroundLowEmphasis">Amount</Text></th>
            <th><Text font="tableHeader" color="foregroundLowEmphasis">Total ({marketInfo && marketInfo.quoteAsset.symbol})</Text></th>
          </tr>
        </thead>
      )}
      <tbody >
        {
          props.priceTableData.map((d, i) => {
            const color = d.side === "b" ? theme.colors.success400 : theme.colors.danger400;
            if (props.className !== "trade_table_asks") {
              total_step += d.td2;
            }

            const breakpoint = Math.round((total_step / total_total) * 100);
            let rowStyle;
            if (props.useGradient) {
              rowStyle = {
                background: `linear-gradient(to right, ${color}, ${color} ${breakpoint}%, ${theme.colors.backgroundHighEmphasis} 0%)`,
              };
            } else {
              rowStyle = {};
            }
            const price =
              typeof d.td1 === "number" ? d.td1.toPrecision(6) : d.td1;
            const amount =
              typeof d.td2 === "number" ? d.td2.toPrecision(6) : d.td2;
            const total =
              typeof d.td3 === "number" ? d.td3.toPrecision(6) : d.td3;

            // reduce after, net one needs to be this percentage
            if (props.className === "trade_table_asks") {
              total_step -= d.td2;
            }
            return (
              <tr key={i} style={rowStyle} onClick={() => onClickRow(d)}>
                <td>
                  <Text font="tableContent" color={d.side === "b" ? "successHighEmphasis" : "dangerHighEmphasis"}>{price}</Text>
                </td>
                <td>
                  <Text font="tableContent" color="foregroundHighEmphasis">{numStringToSymbol(amount, 2)}</Text>
                </td>
                <td>
                  <Text font="tableContent" color="foregroundHighEmphasis">{numStringToSymbol(total, 2)}</Text>
                </td>
              </tr>
            );
          })}
      </tbody>
    </Table>
  );
};

export default TradePriceTable;
