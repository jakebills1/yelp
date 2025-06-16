class CreateBusinesses < ActiveRecord::Migration[8.0]
  def change
    create_table :businesses do |t|
      t.string :name, null: false
      t.string :category
      t.string :address
      t.string :city
      t.string :state
      t.string :zip_code
      t.geometry :location, limit: { srid: 4326, type: "point" }
      
      t.timestamps
    end
    
    add_index :businesses, :location, using: :gist
    add_index :businesses, :category
  end
end
