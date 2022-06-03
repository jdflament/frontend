import React from "react";
import styled from "styled-components";
import { formatPrice } from "lib/utils";
import { SettingsIcon } from "components/atoms/Svg";
import Button from "components/molecules/Button/Button";
import Text from "components/atoms/Text/Text";
// css
import api from "lib/api";
import "./TradeRatesCard.css";
import SettingsModal from "./SettingsModal";
import { TokenPairDropdown } from "components/molecules/Dropdown";
import useModal from "components/hooks/useModal";

const TradeRatesCard = ({ updateMarketChain, marketSummary, rowData, currentMarket, marketInfo }) => {
  const handleOnModalClose = () => {
    onSettingsModalClose()
  }

  const [onSettingsModal, onSettingsModalClose] = useModal(
    <SettingsModal onDismiss={() => handleOnModalClose()} />
  )

  const handleSettings = () => {
    onSettingsModal()
  }

  const isMobile = window.innerWidth < 800

  return (
    <Wrapper>
      <LeftWrapper>
        <MarketSelector>
          <TokenPairDropdown
            width={isMobile ? 83 : 223}
            transparent
            context={currentMarket}
            rowData={rowData}
            updateMarketChain={updateMarketChain}
            currentMarket={currentMarket}
            marketInfo={marketInfo}
          />
        </MarketSelector>
        <RatesCardsWrapper>
          <RatesCard>
            <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">Price</Text>
            <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{marketSummary.price}</Text>
          </RatesCard>
          {/* <RatesCard>
            <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h Change</Text>
            <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">
              {this.props.marketSummary.priceChange &&
                formatPrice(this.props.marketSummary.priceChange / 1)
              }{" "}
              {percentChange !== 'NaN' && `${percentChange}%`}
            </Text>
          </RatesCard> */}
          {
            isMobile ? <></> :
              <>
                <RatesCard>
                  <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h Change</Text>
                  <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{parseFloat(marketSummary["priceChange"]).toFixed(5) ?? '--'}</Text>
                </RatesCard>
                <RatesCard>
                  <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h High</Text>
                  <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{marketSummary["24hi"] ?? '--'}</Text>
                </RatesCard>
                <RatesCard>
                  <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h Low</Text>
                  <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{marketSummary["24lo"] ?? '--'}</Text>
                </RatesCard>
                <RatesCard>
                  <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h Volume({marketInfo && marketInfo.baseAsset.symbol})</Text>
                  <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{marketSummary.baseVolume ?? '--'}</Text>
                </RatesCard>
                <RatesCard>
                  <Text font="primaryExtraSmallSemiBold" color="foregroundLowEmphasis">24h Volume({marketInfo && marketInfo.quoteAsset.symbol})</Text>
                  <Text font="primaryMediumSmallSemiBold" color="foregroundHighEmphasis">{marketSummary.quoteVolume ?? '--'}</Text>
                </RatesCard>
              </>
          }
        </RatesCardsWrapper>
      </LeftWrapper>
      {
        isMobile ?
          <SettingsIcon style={{ marginRight: '20px' }} onClick={handleSettings} /> :
          <Button endIcon={<SettingsIcon />} variant="outlined" scale="imd" mr="20px" onClick={handleSettings}>
            Settings
          </Button>
      }
    </Wrapper>
  )
}

export default TradeRatesCard;

const Wrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`
const LeftWrapper = styled.div`
display: grid;
grid-auto-flow: column;
align-items: center;
`

const RatesCardsWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 40px;
  padding-left: 20px;
`

const MarketSelector = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 10px;
  background-color: ${({ theme }) => theme.colors.backgroundLowEmphasis};
  padding: 0px 24px;
  height: 74px;
`

const RatesCard = styled.div`
  display: grid;
  grid-auto-flow: row;
  align-items: center;
  justify-content: center;
  gap: 2px;
`