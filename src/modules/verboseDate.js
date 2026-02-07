import { L10N } from '../i18n';

export const verboseDate = (
  date = new Date(),
  { locale = 'en-US', now = new Date(), relative = false, ...props } = {},
) => {
  const resolvedDate = date instanceof Date ? date : new Date(date);

  if (relative) {
    const day = resolvedDate.toDateString();
    const today = now.toDateString();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toDateString();

    if (day === today) return L10N.TODAY;
    if (day === yesterday) return L10N.YESTERDAY;
  }

  return resolvedDate.toLocaleDateString ? resolvedDate.toLocaleDateString(locale, props) : resolvedDate;
};
