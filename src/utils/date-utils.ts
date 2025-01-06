export const alphaVantageDateFormatter = (date: Date): string => {
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${YYYY}${MM}${DD}T${HH}${mm}`;
};

export const alphaVantageDateDecoder = (formattedDate: string): Date => {
  if (!/^\d{8}T\d{6}$/.test(formattedDate)) {
    throw new Error('Invalid Alpha Vantage date format. Expected format: YYYYMMDDTHHmmss');
  }

  const year = parseInt(formattedDate.slice(0, 4), 10);
  const month = parseInt(formattedDate.slice(4, 6), 10) - 1;
  const day = parseInt(formattedDate.slice(6, 8), 10);
  const hour = parseInt(formattedDate.slice(9, 11), 10);
  const minute = parseInt(formattedDate.slice(11, 13), 10);
  const second = parseInt(formattedDate.slice(13, 15), 10);

  return new Date(year, month, day, hour, minute, second);
};
