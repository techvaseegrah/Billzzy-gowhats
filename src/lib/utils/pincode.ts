// utils/pincode.ts
export async function getPincodeDetails(pincode: string) {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data[0].Status === 'Error') {
        throw new Error('Invalid pincode');
      }
  
      const postOffice = data[0].PostOffice[0];
      return {
        city: postOffice.Block || postOffice.Division,
        district: postOffice.District,
        state: postOffice.State,
        country: 'India'
      };
    } catch (error) {
      throw new Error('Failed to fetch pincode details');
    }
  }