import { DefaultTheme } from '@satoshi-ltd/nano-design/build/module/theme';

export const CommonTheme = {
  ...DefaultTheme,

  // -- typography -------------------------------------------------------------
  $fontWeightDefault: '400',
  $fontWeightBold: '600',
  $fontWeightDefaultSecondary: '400',
  $fontWeightBoldSecondary: '700',
  // $fontSizeTiny: 9,

  $lineHeightDefaultRatio: 1.25,
  $lineHeightBodyRatio: 1.5,

  // -- palette ----------------------------------------------------------------
  $scolorAccent: '#FFC431',

  // -- <Icon> -----------------------------------------------------------------
  $iconFamily: 'shield-icons',
  $iconGlyphs: require('../../assets/fonts/Shield-Icons.json'),
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
