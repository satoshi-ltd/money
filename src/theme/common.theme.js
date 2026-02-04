export const CommonTheme = {
  // -- spacing ---------------------------------------------------------------
  $spaceXXS: 4,
  $spaceXS: 8,
  $spaceS: 12,
  $spaceM: 16,
  $spaceL: 24,
  $spaceXL: 32,
  $spaceXXL: 48,
  $viewOffset: '$spaceM',

  // -- typography ------------------------------------------------------------
  $fontDefault: 'font-default',
  $fontBold: 'font-bold',
  $fontDefaultSecondary: 'font-default-secondary',
  $fontBoldSecondary: 'font-bold-secondary',
  $fontSizeTiny: 11,
  $fontSizeCaption: 13,
  $fontSizeDetail: 15,
  $fontSizeDefault: 15,
  $fontSizeSubtitle: 19,
  $fontSizeTitle: 23,
  $fontWeightDefault: '400',
  $fontWeightBold: '700',
  $fontWeightDefaultSecondary: '400',
  $fontWeightBoldSecondary: '800',

  $lineHeightDefaultRatio: 1.25,
  $lineHeightBodyRatio: 1.25,

  // -- palette ----------------------------------------------------------------
  $colorBase: '#FFFEFE',
  $colorSurface: '#ffffff',
  $colorBorder: '#f0f0f0',
  $colorContent: '#000000',
  $colorContentLight: '#555555',
  $colorDisabled: '#999999',
  $colorError: '#E25555',

  $scolorAccent: '#FFC431',
  $colorAccent: '$scolorAccent',

  // -- border ----------------------------------------------------------------
  $borderRadius: '$spaceXS',
  $borderWidth: 1,

  // -- <Icon> -----------------------------------------------------------------
  $iconSize: 20,
  $iconSizeSmall: 14,
  $iconSizeCaption: 16,
  $iconSizeSubtitle: 24,
  $iconSizeTitle: 28,

  // -- <InputText> ------------------------------------------------------------
  $inputTextFontSize: 16,
  $inputTextHeight: '$spaceM * 4',
  $inputBorderColor: '$colorBorder',
  $inputBorderColorFocus: '$colorAccent',
  $inputBorderRadius: '$borderRadius',
  $inputBorderStyle: 'solid',
  $inputBorderWidth: 1,
  $inputColor: '$colorContent',
  $inputFontFamily: '$fontBold',
  $inputFontWeight: '$fontWeightBold',
  $inputPaddingHorizontal: '$spaceS',
  $inputPaddingVertical: '$spaceS',
  $inputPlaceholderColor: '$colorContentLight',

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
