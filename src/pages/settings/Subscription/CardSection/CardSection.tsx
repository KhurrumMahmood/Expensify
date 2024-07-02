import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as Subscription from '@userActions/Subscription';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import PreTrialBillingBanner from './BillingBanner/PreTrialBillingBanner';
import SubscriptionBillingBanner from './BillingBanner/SubscriptionBillingBanner';
import CardSectionActions from './CardSectionActions';
import CardSectionDataEmpty from './CardSectionDataEmpty';
import type {BillingStatusResult} from './utils';
import CardSectionUtils from './utils';

function CardSection() {
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [privateSubscription] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [subscriptionRetryBillingStatusPending] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING);
    const [subscriptionRetryBillingStatusSuccessful] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL);
    const [subscriptionRetryBillingStatusFailed] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED);
    const {isOffline} = useNetwork();
    const defaultCard = useMemo(() => Object.values(fundList ?? {}).find((card) => card.accountData?.additionalData?.isBillingCard), [fundList]);

    const cardMonth = useMemo(() => DateUtils.getMonthNames(preferredLocale)[(defaultCard?.accountData?.cardMonth ?? 1) - 1], [defaultCard?.accountData?.cardMonth, preferredLocale]);

    const [billingStatus, setBillingStatus] = useState<BillingStatusResult | undefined>(CardSectionUtils.getBillingStatus(translate, defaultCard?.accountData?.cardNumber ?? ''));

    const nextPaymentDate = !isEmptyObject(privateSubscription) ? CardSectionUtils.getNextBillingDate() : undefined;

    const sectionSubtitle = defaultCard && !!nextPaymentDate ? translate('subscription.cardSection.cardNextPayment', {nextPaymentDate}) : translate('subscription.cardSection.subtitle');

    useEffect(() => {
        setBillingStatus(CardSectionUtils.getBillingStatus(translate, defaultCard?.accountData?.cardNumber ?? ''));
    }, [subscriptionRetryBillingStatusPending, subscriptionRetryBillingStatusSuccessful, subscriptionRetryBillingStatusFailed, defaultCard?.accountData?.cardNumber, translate]);

    const handleRetryPayment = () => {
        Subscription.clearOutstandingBalance();
    };

    const handleBillingBannerClose = () => {
        setBillingStatus(undefined);
    };

    let BillingBanner: React.ReactNode | undefined;
    if (CardSectionUtils.shouldShowPreTrialBillingBanner()) {
        BillingBanner = <PreTrialBillingBanner />;
    } else if (billingStatus) {
        BillingBanner = (
            <SubscriptionBillingBanner
                title={billingStatus.title}
                subtitle={billingStatus.subtitle}
                isError={billingStatus.isError}
                icon={billingStatus.icon}
                rightIcon={billingStatus.rightIcon}
                onRightIconPress={handleBillingBannerClose}
                rightIconAccessibilityLabel={translate('common.close')}
            />
        );
    }

    return (
        <Section
            title={translate('subscription.cardSection.title')}
            subtitle={sectionSubtitle}
            isCentralPane
            titleStyles={styles.textStrong}
            subtitleMuted
            banner={BillingBanner}
        >
            <View style={[styles.mt8, styles.mb3, styles.flexRow]}>
                {!isEmptyObject(defaultCard?.accountData) && (
                    <>
                        <View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <Icon
                                src={Expensicons.CreditCard}
                                additionalStyles={styles.subscriptionAddedCardIcon}
                                fill={theme.text}
                                medium
                            />
                            <View style={styles.flex1}>
                                <Text style={styles.textStrong}>{translate('subscription.cardSection.cardEnding', {cardNumber: defaultCard?.accountData?.cardNumber})}</Text>
                                <Text style={styles.mutedNormalTextLabel}>
                                    {translate('subscription.cardSection.cardInfo', {
                                        name: defaultCard?.accountData?.addressName,
                                        expiration: `${cardMonth} ${defaultCard?.accountData?.cardYear}`,
                                        currency: defaultCard?.accountData?.currency,
                                    })}
                                </Text>
                            </View>
                        </View>
                        <CardSectionActions />
                    </>
                )}
                {isEmptyObject(defaultCard?.accountData) && <CardSectionDataEmpty />}
            </View>
            {billingStatus?.isRetryAvailable !== undefined && (
                <Button
                    text={translate('subscription.cardSection.retryPaymentButton')}
                    isDisabled={isOffline || !billingStatus?.isRetryAvailable}
                    isLoading={subscriptionRetryBillingStatusPending}
                    onPress={handleRetryPayment}
                    style={[styles.w100, styles.mt5]}
                    large
                />
            )}
            {!!account?.hasPurchases && (
                <MenuItem
                    shouldShowRightIcon
                    icon={Expensicons.History}
                    iconStyles={[]}
                    wrapperStyle={styles.sectionMenuItemTopDescription}
                    style={styles.mt5}
                    title={translate('subscription.cardSection.viewPaymentHistory')}
                    titleStyle={styles.textStrong}
                    onPress={() => Navigation.navigate(ROUTES.SEARCH.getRoute(CONST.SEARCH.TAB.ALL))}
                    hoverAndPressStyle={styles.hoveredComponentBG}
                />
            )}
        </Section>
    );
}

CardSection.displayName = 'CardSection';

export default CardSection;
