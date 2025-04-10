import { DefaultTheme } from '@satoshi-ltd/nano-design/build/module/theme';

export const CommonTheme = {
  ...DefaultTheme,

  // -- typography -------------------------------------------------------------
  $fontSizeTitle: 30,
  $fontWeightDefault: '400',
  $fontWeightBold: '600',
  $fontWeightDefaultSecondary: '400',
  $fontWeightBoldSecondary: '700',

  $lineHeightDefaultRatio: 1.25,
  $lineHeightBodyRatio: 1.25,

  // -- palette ----------------------------------------------------------------
  $scolorAccent: '#FFC431',

  // -- border ----------------------------------------------------------------
  $borderRadius: '$spaceXS',

  // -- <Icon> -----------------------------------------------------------------
  $iconSize: 24,

  // -- <InputText> ------------------------------------------------------------
  $inputTextFontSize: '$fontSizeSubtitle',
  $inputTextHeight: '$spaceM * 4.5',

  // == Components =============================================================
  // -- <Card> -----------------------------------------------------------------
  $cardGap: '$spaceS',

  // -- <CardAccount> ----------------------------------------------------------
  $cardAccountSize: '$spaceM * 10',
  $cardAccountSnap: '$cardAccountSize + $cardGap',

  // -- <Option> ---------------------------------------------------------------
  $optionSize: '$spaceM * 5.2',
  $optionSnap: '$optionSize + $cardGap',
};
