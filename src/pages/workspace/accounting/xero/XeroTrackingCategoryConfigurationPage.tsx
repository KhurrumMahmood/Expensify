import React, {useMemo} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import {getTrackingCategories} from '@libs/actions/connections/ConnectToXero';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {XeroTrackingCategory} from '@src/types/onyx/Policy';

function XeroTrackingCategoryConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const xeroConfig = policy?.connections?.xero?.config;
    const isSwitchOn = !!xeroConfig?.importTrackingCategories;

    const menuItems = useMemo(() => {
        const trackingCategories = getTrackingCategories(policy);
        return trackingCategories.map((category: XeroTrackingCategory & {value: string}) => ({
            id: category.id,
            description: translate('workspace.xero.mapTrackingCategoryTo', {categoryName: category.name}) as TranslationPaths,
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES_MAP.getRoute(policyID, category.id, category.name)),
            title: translate(`workspace.xero.trackingCategoriesOptions.${category.value.toLowerCase()}` as TranslationPaths),
        }));
    }, [translate, policy, policyID]);

    return (
        <ConnectionLayout
            displayName={XeroTrackingCategoryConfigurationPage.displayName}
            headerTitle="workspace.xero.trackingCategories"
            title="workspace.xero.trackingCategoriesDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={translate('workspace.xero.trackingCategories')}
                isActive={isSwitchOn}
                wrapperStyle={styles.mv3}
                onToggle={() =>
                    Connections.updatePolicyConnectionConfig(
                        policyID,
                        CONST.POLICY.CONNECTIONS.NAME.XERO,
                        CONST.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES,
                        !xeroConfig?.importTrackingCategories,
                    )
                }
                errors={ErrorUtils.getLatestErrorField(xeroConfig ?? {}, CONST.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES)}
                onCloseError={() => Policy.clearXeroErrorField(policyID, CONST.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES)}
            />
            {xeroConfig?.importTrackingCategories && (
                <View>
                    {menuItems.map((menuItem) => (
                        <MenuItemWithTopDescription
                            key={menuItem.description}
                            title={menuItem.title}
                            description={menuItem.description}
                            shouldShowRightIcon
                            onPress={menuItem.onPress}
                            wrapperStyle={styles.sectionMenuItemTopDescription}
                            brickRoadIndicator={xeroConfig?.errorFields?.[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${menuItem.id}`] ? 'error' : undefined}
                        />
                    ))}
                </View>
            )}
        </ConnectionLayout>
    );
}

XeroTrackingCategoryConfigurationPage.displayName = 'XeroTrackCategoriesPage';
export default withPolicyConnections(XeroTrackingCategoryConfigurationPage);
