class Business < ApplicationRecord
  validates :name, presence: true
  validates :location, presence: true

  # Scope for finding businesses within distance (in meters)
  scope :within_distance, ->(point, distance_meters) {
    where("ST_DWithin(location, ST_GeomFromText(?), ?)", point, distance_meters)
  }

  # Scope for finding businesses within distance ordered by proximity
  scope :near, ->(point, distance_meters) {
    within_distance(point, distance_meters)
      .select("*, ST_Distance(location, ST_GeomFromText('#{point}')) as distance")
      .order("distance")
  }
end