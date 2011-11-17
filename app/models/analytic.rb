class Analytic
  attr_accessor :_id, :s, :event, :data, :ts

  def self.build(account_id, params={})
    analytic = Analytic.new

    analytic._id = params["_id"] if params["_id"].present?
    analytic.s = params["s"] if params["s"].present?
    analytic.data = params["d"] if params["d"].present?
    analytic.ts = params["ts"] if params["ts"].present?

    if analytic.data.present? and analytic.data["e"].present?
      event_id = analytic.data["e"]
      analytic.event = Event.find(account_id, event_id)
    end

    analytic
  end

  def self.for_session(account_id, session_id)
    analytics = []

    session_id = BSON::ObjectId.from_string(session_id) if session_id.is_a?(String)

    # analytics_params = @@db.collection("analytics_#{account_id}").find({"s" => session_id, "d.e" => {"$exists" => true}}).sort(["ts", -1])
    analytics_params = @@db.collection("analytics_#{account_id}").find({"s" => session_id}).sort(["ts", -1])

    analytics_params.each do |params|
      analytic = Analytic.build(account_id, params)
      analytics.push(analytic)
    end

    analytics
  end

  def self.since(account_id, time, event_id=nil)
    analytics = []

    if event_id.present?
      analytics_params = @@db.collection("analytics_#{account_id}").find({"ts" => {"$gt" => time.utc}, "d.e" => event_id}).sort(["ts", -1])
    else
      analytics_params = @@db.collection("analytics_#{account_id}").find({"ts" => {"$gt" => time.utc}}).sort(["ts", -1])
    end

    analytics_params.each do |params|
      analytic = Analytic.build(account_id, params)
      analytics.push(analytic)
    end

    analytics
  end

  @@map_preload_matrix_blocks = "function() { var ts = this.ts; ts.setMinutes(0, 0, 0); emit(ts.getTime(), {count: 1}); }"

  @@reduce_preload_matrix_blocks =
      "function(key, values) { " +
          "var sum = 0; " +
          "values.forEach(function(f) { " +
          " sum += f.count; " +
          "}); " +
          "return {count: sum};" +
          "};"

  def self.preload_matrix_blocks(account_id)
    blocks = @@db.collection("analytics_#{account_id}").map_reduce(@@map_preload_matrix_blocks, @@reduce_preload_matrix_blocks, {:raw => true, 'out' => {'inline' => true}, 'query' => {'ts' => {'$gt' => 7.days.ago.utc.at_beginning_of_day}}})

    blocks
  end
end
