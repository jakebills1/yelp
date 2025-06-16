class Business < ApplicationRecord
  validates :name, presence: true
  validates :location, presence: true

  # Scope for finding businesses within distance (in meters)
  scope :within_distance, ->(point, distance_meters) {
    where("ST_DWithin(location, ST_GeomFromText(?, 4326), ?)", point, distance_meters)
  }

  # Scope for finding businesses within distance ordered by proximity
  scope :near, ->(point, distance_meters) {
    within_distance(point, distance_meters)
      .select("*, ST_Distance(location, ST_GeomFromText('#{point}', 4326)) as distance")
      .order("distance")
  }

  # Extract latitude from RGeo point object
  def latitude
    location&.y
  end

  # Extract longitude from RGeo point object
  def longitude
    location&.x
  end

  # Convert distance from meters to miles (if distance attribute exists from query)
  def distance_miles
    if respond_to?(:distance) && distance
      (distance.to_f / 1609.34).round(2)
    end
  end
end