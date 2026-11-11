/**
 * Official Indian States & Union Territories Master Directory
 * Contains all 28 States and 8 Union Territories with key districts & cities.
 */

const INDIAN_STATES_AND_UTS = [
  // 28 States
  {
    name: 'Andhra Pradesh',
    type: 'STATE',
    districts: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kurnool', 'Nellore', 'Anantapur', 'Kakinada', 'Rajahmundry', 'Kadapa']
  },
  {
    name: 'Arunachal Pradesh',
    type: 'STATE',
    districts: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila', 'Tezu']
  },
  {
    name: 'Assam',
    type: 'STATE',
    districts: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat', 'Nagaon', 'Tezpur', 'Tinsukia', 'Bongaigaon']
  },
  {
    name: 'Bihar',
    type: 'STATE',
    districts: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar']
  },
  {
    name: 'Chhattisgarh',
    type: 'STATE',
    districts: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Ambikapur']
  },
  {
    name: 'Goa',
    type: 'STATE',
    districts: ['North Goa (Panaji)', 'South Goa (Margao)', 'Vasco da Gama', 'Mapusa', 'Ponda']
  },
  {
    name: 'Gujarat',
    type: 'STATE',
    districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Navsari']
  },
  {
    name: 'Haryana',
    type: 'STATE',
    districts: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula']
  },
  {
    name: 'Himachal Pradesh',
    type: 'STATE',
    districts: ['Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu', 'Manali', 'Bilaspur', 'Hamirpur', 'Una', 'Chamba']
  },
  {
    name: 'Jharkhand',
    type: 'STATE',
    districts: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh', 'Giridih', 'Ramgarh']
  },
  {
    name: 'Karnataka',
    type: 'STATE',
    districts: ['Bengaluru Urban', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi', 'Kalaburagi', 'Davanagere', 'Ballari', 'Shivamogga', 'Tumakuru']
  },
  {
    name: 'Kerala',
    type: 'STATE',
    districts: ['Thiruvananthapuram', 'Kochi (Ernakulam)', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Kannur', 'Kottayam', 'Malappuram']
  },
  {
    name: 'Madhya Pradesh',
    type: 'STATE',
    districts: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa']
  },
  {
    name: 'Maharashtra',
    type: 'STATE',
    districts: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Chhatrapati Sambhajinagar', 'Solapur', 'Kolhapur', 'Navi Mumbai', 'Amravati']
  },
  {
    name: 'Manipur',
    type: 'STATE',
    districts: ['Imphal West', 'Imphal East', 'Churachandpur', 'Thoubal', 'Bishnupur', 'Ukhrul', 'Senapati']
  },
  {
    name: 'Meghalaya',
    type: 'STATE',
    districts: ['Shillong (East Khasi Hills)', 'Tura (West Garo Hills)', 'Jowai', 'Nongpoh', 'Williamnagar']
  },
  {
    name: 'Mizoram',
    type: 'STATE',
    districts: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Mamit', 'Lawngtlai']
  },
  {
    name: 'Nagaland',
    type: 'STATE',
    districts: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Mon', 'Zunheboto']
  },
  {
    name: 'Odisha',
    type: 'STATE',
    districts: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada']
  },
  {
    name: 'Punjab',
    type: 'STATE',
    districts: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali (SAS Nagar)', 'Hoshiarpur', 'Pathankot', 'Moga']
  },
  {
    name: 'Rajasthan',
    type: 'STATE',
    districts: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar']
  },
  {
    name: 'Sikkim',
    type: 'STATE',
    districts: ['Gangtok (East Sikkim)', 'Namchi (South Sikkim)', 'Gyalshing (West Sikkim)', 'Mangan (North Sikkim)']
  },
  {
    name: 'Tamil Nadu',
    type: 'STATE',
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul']
  },
  {
    name: 'Telangana',
    type: 'STATE',
    districts: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Siddipet']
  },
  {
    name: 'Tripura',
    type: 'STATE',
    districts: ['Agartala (West Tripura)', 'Udaipur (Gomati)', 'Dharmanagar (North Tripura)', 'Kailashahar (Unakoti)', 'Ambassa (Dhalai)']
  },
  {
    name: 'Uttar Pradesh',
    type: 'STATE',
    districts: ['Lucknow', 'Kanpur', 'Varanasi', 'Noida (Gautam Buddha Nagar)', 'Ghaziabad', 'Agra', 'Prayagraj', 'Meerut', 'Bareilly', 'Aligarh', 'Gorakhpur']
  },
  {
    name: 'Uttarakhand',
    type: 'STATE',
    districts: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Nainital', 'Rudrapur', 'Kashipur', 'Almora']
  },
  {
    name: 'West Bengal',
    type: 'STATE',
    districts: ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol', 'Bardhaman', 'Kharagpur', 'Malda', 'Darjeeling', 'Berhampore']
  },

  // 8 Union Territories
  {
    name: 'Andaman and Nicobar Islands',
    type: 'UNION_TERRITORY',
    districts: ['Port Blair (South Andaman)', 'North & Middle Andaman', 'Nicobar']
  },
  {
    name: 'Chandigarh',
    type: 'UNION_TERRITORY',
    districts: ['Chandigarh']
  },
  {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    type: 'UNION_TERRITORY',
    districts: ['Daman', 'Diu', 'Silvassa']
  },
  {
    name: 'Delhi',
    type: 'UNION_TERRITORY',
    districts: ['New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'South West Delhi', 'North West Delhi', 'Shahdara']
  },
  {
    name: 'Jammu and Kashmir',
    type: 'UNION_TERRITORY',
    districts: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua', 'Pulwama', 'Kupwara', 'Rajouri']
  },
  {
    name: 'Ladakh',
    type: 'UNION_TERRITORY',
    districts: ['Leh', 'Kargil']
  },
  {
    name: 'Lakshadweep',
    type: 'UNION_TERRITORY',
    districts: ['Kavaratti', 'Agatti', 'Amini', 'Andrott', 'Minicoy']
  },
  {
    name: 'Puducherry',
    type: 'UNION_TERRITORY',
    districts: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam']
  }
];

module.exports = {
  INDIAN_STATES_AND_UTS,
  TOTAL_STATES_AND_UTS_COUNT: INDIAN_STATES_AND_UTS.length, // exactly 36
  STATES_COUNT: INDIAN_STATES_AND_UTS.filter(s => s.type === 'STATE').length, // exactly 28
  UTS_COUNT: INDIAN_STATES_AND_UTS.filter(s => s.type === 'UNION_TERRITORY').length // exactly 8
};
