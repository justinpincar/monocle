@@db = Mongo::Connection.new("staff.mongohq.com", 10085).db("monocle-production")
@@db.authenticate("monocle", "monocle_mongo")

MongoMapper.connection = Mongo::Connection.new('staff.mongohq.com', 10085, :logger => Rails.logger)
MongoMapper.database = "monocle-production"
MongoMapper.database.authenticate('monocle', 'monocle_mongo')
