# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

require 'faker'

# Clear existing data
Business.destroy_all

# Define city boundaries (lat/lng bounds)
CITIES = {
  'San Francisco' => { 
    lat: [37.7, 37.8], 
    lng: [-122.5, -122.4],
    state: 'CA',
    zip_codes: ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110']
  },
  'New York' => { 
    lat: [40.7, 40.8], 
    lng: [-74.0, -73.9],
    state: 'NY',
    zip_codes: ['10001', '10002', '10003', '10004', '10005', '10006', '10007', '10009']
  },
  'Chicago' => { 
    lat: [41.8, 41.9], 
    lng: [-87.7, -87.6],
    state: 'IL', 
    zip_codes: ['60601', '60602', '60603', '60604', '60605', '60606', '60607', '60608']
  }
}

BUSINESS_CATEGORIES = [
  'restaurant', 'cafe', 'bar', 'coffee_shop', 'bakery', 'fast_food',
  'grocery_store', 'pharmacy', 'gas_station', 'bank', 'gym', 'salon',
  'bookstore', 'electronics_store', 'clothing_store', 'hotel'
]

puts "Seeding businesses..."

CITIES.each do |city_name, city_data|
  puts "Creating businesses for #{city_name}..."
  
  150.times do
    # Generate random coordinates within city bounds
    lat = rand(city_data[:lat][0]..city_data[:lat][1])
    lng = rand(city_data[:lng][0]..city_data[:lng][1])
    
    # Generate realistic business name based on category
    category = BUSINESS_CATEGORIES.sample
    business_name = case category
    when 'restaurant'
      "#{Faker::Restaurant.name}"
    when 'cafe', 'coffee_shop'
      "#{Faker::Coffee.blend_name} #{['Cafe', 'Coffee', 'Roasters'].sample}"
    when 'bar'
      "#{Faker::Beer.name} #{['Bar', 'Pub', 'Tavern'].sample}"
    when 'bakery'
      "#{Faker::Dessert.variety} #{['Bakery', 'Pastries', 'Bread Co'].sample}"
    else
      "#{Faker::Company.name} #{category.titleize}"
    end
    
    Business.create!(
      name: business_name,
      category: category,
      address: Faker::Address.street_address,
      city: city_name,
      state: city_data[:state],
      zip_code: city_data[:zip_codes].sample,
      location: "POINT(#{lng} #{lat})"
    )
  end
end

puts "Created #{Business.count} businesses across #{CITIES.keys.join(', ')}"
puts "Categories: #{Business.distinct.pluck(:category).sort.join(', ')}"