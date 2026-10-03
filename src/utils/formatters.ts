export const formatCurrency = (val: number, currency = '$'): string => {
  if (isNaN(val) || !isFinite(val)) return `${currency}0.00`;
  return `${currency}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatPercent = (val: number): string => {
  if (isNaN(val) || !isFinite(val)) return '0.00%';
  return `${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
};

export const formatNumber = (val: number): string => {
  if (isNaN(val) || !isFinite(val)) return '0';
  return val.toLocaleString('en-US');
};

export const formatContentHtml = (html: string): string => {
  if (!html) return '';
  return html;
};
