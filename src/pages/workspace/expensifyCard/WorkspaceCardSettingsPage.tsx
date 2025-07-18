import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import TextLink from '@components/TextLink';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLastFourDigits} from '@libs/BankAccountUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceCardSettingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS>;

function WorkspaceCardSettingsPage({route}: WorkspaceCardSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;
    const defaultFundID = useDefaultFundID(policyID);

    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: false});
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`, {canBeMissing: false});

    const paymentBankAccountID = cardSettings?.paymentBankAccountID;
    const paymentBankAccountNumber = cardSettings?.paymentBankAccountNumber;
    const isMonthlySettlementAllowed = cardSettings?.isMonthlySettlementAllowed ?? false;
    const settlementFrequency = cardSettings?.monthlySettlementDate ? CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY : CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    const isSettlementFrequencyBlocked = !isMonthlySettlementAllowed && settlementFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    const bankAccountNumber = bankAccountList?.[paymentBankAccountID?.toString() ?? '']?.accountData?.accountNumber ?? paymentBankAccountNumber ?? '';

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceCardSettingsPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton title={translate('workspace.common.settings')} />
                <ScrollView
                    contentContainerStyle={styles.flexGrow1}
                    addBottomSafeAreaPadding
                >
                    <View>
                        <OfflineWithFeedback errorRowStyles={styles.mh5}>
                            <MenuItemWithTopDescription
                                description={translate('workspace.expensifyCard.settlementAccount')}
                                title={bankAccountNumber ? `${CONST.MASKED_PAN_PREFIX}${getLastFourDigits(bankAccountNumber)}` : ''}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT.getRoute(policyID, Navigation.getActiveRoute()))}
                            />
                        </OfflineWithFeedback>
                        <OfflineWithFeedback errorRowStyles={styles.mh5}>
                            <MenuItemWithTopDescription
                                description={translate('workspace.expensifyCard.settlementFrequency')}
                                title={translate(`workspace.expensifyCard.frequency.${settlementFrequency}`)}
                                shouldShowRightIcon={settlementFrequency !== CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY}
                                interactive={!isSettlementFrequencyBlocked}
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS_FREQUENCY.getRoute(policyID))}
                                hintText={
                                    isSettlementFrequencyBlocked ? (
                                        <>
                                            {translate('workspace.expensifyCard.settlementFrequencyInfo')}{' '}
                                            <TextLink
                                                href={CONST.EXPENSIFY_CARD.MANAGE_EXPENSIFY_CARDS_ARTICLE_LINK}
                                                style={styles.label}
                                            >
                                                {translate('common.learnMore')}
                                            </TextLink>
                                        </>
                                    ) : undefined
                                }
                            />
                        </OfflineWithFeedback>
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCardSettingsPage.displayName = 'WorkspaceCardSettingsPage';

export default WorkspaceCardSettingsPage;
