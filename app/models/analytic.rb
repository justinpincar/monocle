class Analytic
  attr_accessor :_id, :event, :data, :ts

  def self.build(account_id, params={})
    analytic = Analytic.new

    analytic._id = params["_id"] if params["_id"].present?
    analytic.data = params["d"] if params["d"].present?
    analytic.ts = params["ts"] if params["ts"].present?

    if analytic.data.present? and analytic.data["e"].present?
      event_id = analytic.data["e"]
      analytic.event = Event.find(account_id, event_id)
    end

    analytic
  end

  def self.for_user(account_id, user_id)
    analytics = []

    analytics_params = @@db.collection("analytics_#{account_id}").find({"u" => BSON::ObjectId.from_string(user_id), "d.e" => {"$exists" => true}}).sort(["ts", -1])
    analytics_params.each do |params|
      analytic = Analytic.build(account_id, params)
      analytics.push(analytic)
    end

    analytics
  end
end