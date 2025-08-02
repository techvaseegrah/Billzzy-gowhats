export function formatDate(date: string | Date, type: 'date' | 'time' = 'date'): string {
    const d = new Date(date);
    
    if (type === 'date') {
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }


  export  function generateRandomSixDigitNumber() {
    // Generate a random number between 100000 and 999999
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    console.log(randomNumber);
    
    return randomNumber.toString();
  }


  export function getFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert hour '0' to '12'
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${formattedMinutes} ${ampm}`;
  }
  
  
  export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  }


  import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// lib/utils.ts
export function getDateRange(timeRange: string) {
  const today = new Date();
  let startDate = new Date();

  switch (timeRange) {
    case 'week':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(today.getMonth() - 1);
      break;
    case '3months':
      startDate.setMonth(today.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    default:
      startDate.setDate(today.getDate() - 7);
  }

  return {
    startDate,
    endDate: today,
  };
}


export function splitAddressIntoThreeParts(address: string): [string, string, string] {
  const MAX_LENGTH = 30; // Maximum length per SMS variable
  const words = address.split(' ');
  const parts: string[] = [];
  let currentPart = '';

  for (const word of words) {
    if ((currentPart + ' ' + word).length <= MAX_LENGTH) {
      currentPart = currentPart ? `${currentPart} ${word}` : word;
    } else {
      parts.push(currentPart);
      currentPart = word;
    }
  }
  
  if (currentPart) {
    parts.push(currentPart);
  }

  // Ensure exactly three parts
  while (parts.length < 3) {
    parts.push('');
  }
  
  // If more than 3 parts, combine extra parts into the last one
  if (parts.length > 3) {
    parts[2] = parts.slice(2).join(' ');
    parts.splice(3);
  }

  // Truncate each part to maximum length
  return parts.map(part => part.substring(0, MAX_LENGTH)) as [string, string, string];
}
