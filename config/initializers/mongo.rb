@@db = Mongo::Connection.new("localhost", 27017).db("monocle-#{Rails.env}")

MongoMapper.connection = Mongo::Connection.new('localhost', 27017, :logger => Rails.logger)
MongoMapper.database = "monocle-#{Rails.env}"
