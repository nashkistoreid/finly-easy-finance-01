export interface Bank {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

export const banks: Bank[] = [
  {
    id: 'bca',
    name: 'Bank Central Asia',
    shortName: 'BCA',
    icon: '🏦',
    bgColor: 'bg-blue-600',
    textColor: 'text-white'
  },
  {
    id: 'bni',
    name: 'Bank Negara Indonesia',
    shortName: 'BNI',
    icon: '🏛️',
    bgColor: 'bg-orange-600',
    textColor: 'text-white'
  },
  {
    id: 'bri',
    name: 'Bank Rakyat Indonesia',
    shortName: 'BRI',
    icon: '🏪',
    bgColor: 'bg-blue-700',
    textColor: 'text-white'
  },
  {
    id: 'mandiri',
    name: 'Bank Mandiri',
    shortName: 'Mandiri',
    icon: '💳',
    bgColor: 'bg-yellow-600',
    textColor: 'text-blue-900'
  },
  {
    id: 'bsi',
    name: 'Bank Syariah Indonesia',
    shortName: 'BSI',
    icon: '🕌',
    bgColor: 'bg-green-600',
    textColor: 'text-white'
  },
  {
    id: 'jago',
    name: 'Bank Jago',
    shortName: 'Jago',
    icon: '📱',
    bgColor: 'bg-purple-600',
    textColor: 'text-white'
  },
  {
    id: 'seabank',
    name: 'SeaBank',
    shortName: 'SeaBank',
    icon: '🌊',
    bgColor: 'bg-cyan-600',
    textColor: 'text-white'
  },
  {
    id: 'blu',
    name: 'BCA Digital (blu)',
    shortName: 'blu',
    icon: '💙',
    bgColor: 'bg-sky-500',
    textColor: 'text-white'
  },
  {
    id: 'jenius',
    name: 'Jenius BTPN',
    shortName: 'Jenius',
    icon: '🎯',
    bgColor: 'bg-indigo-600',
    textColor: 'text-white'
  },
  {
    id: 'danamon',
    name: 'Bank Danamon',
    shortName: 'Danamon',
    icon: '🏢',
    bgColor: 'bg-red-600',
    textColor: 'text-white'
  },
  {
    id: 'cimb',
    name: 'CIMB Niaga',
    shortName: 'CIMB',
    icon: '🏦',
    bgColor: 'bg-red-700',
    textColor: 'text-white'
  },
  {
    id: 'permata',
    name: 'Bank Permata',
    shortName: 'Permata',
    icon: '💎',
    bgColor: 'bg-emerald-600',
    textColor: 'text-white'
  },
  {
    id: 'gopay',
    name: 'GoPay',
    shortName: 'GoPay',
    icon: '🏍️',
    bgColor: 'bg-green-500',
    textColor: 'text-white'
  },
  {
    id: 'ovo',
    name: 'OVO',
    shortName: 'OVO',
    icon: '🟣',
    bgColor: 'bg-purple-700',
    textColor: 'text-white'
  },
  {
    id: 'dana',
    name: 'DANA',
    shortName: 'DANA',
    icon: '💰',
    bgColor: 'bg-blue-500',
    textColor: 'text-white'
  },
  {
    id: 'cash',
    name: 'Cash/Tunai',
    shortName: 'Cash',
    icon: '💵',
    bgColor: 'bg-gray-600',
    textColor: 'text-white'
  },
  {
    id: 'other',
    name: 'Lainnya',
    shortName: 'Lainnya',
    icon: '🏪',
    bgColor: 'bg-gray-500',
    textColor: 'text-white'
  }
];

export const getBankById = (id: string): Bank | undefined => {
  return banks.find(bank => bank.id === id);
};