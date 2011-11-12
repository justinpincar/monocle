class Event
  attr_accessor :_id, :display, :type, :heat, :c_at, :u_at

  def self.build(event, params={})
    event_params = params["event"]

    event._id = event_params["_id"] if event_params["_id"].present?
    event.type = event_params["type"].to_i if event_params["type"].present?
    event.display = event_params["display"] if event_params["display"].present?
    event.heat = event_params["heat"].to_i if event_params["heat"].present?
    event.c_at = event_params["c_at"] if event_params["c_at"].present?
    event.u_at = event_params["u_at"] if event_params["u_at"].present?
    event
  end

  def update(params={})
    self.type = params["type"].to_i if params["type"].present?
    self.display = params["display"] if params["display"].present?
    self.heat = params["heat"].to_i if params["heat"].present?
  end

  def save(account_id)
    now = Time.now

    if self._id.nil?
      self._id = BSON::ObjectId.new
      @@db.collection("events_#{account_id}").insert({_id: _id, display: display, type: type, heat: heat, c_at: now, u_at: now})
    else
      @@db.collection("events_#{account_id}").update({_id: _id},  {"$set" => {display: display, type: type, heat: heat, u_at: now}})
    end
  end

  def destroy(account_id)
    @@db.collection("events_#{account_id}").remove({_id: self._id})
  end

  def self.all(account_id)
    events = []

    events_params = @@db.collection("events_#{account_id}").find()
    events_params.each do |params|
      event = generate(params)
      events.push(event)
    end

    events
  end

  @events = {}
  def self.find(account_id, id)
    begin
      id = BSON::ObjectId.from_string(id) if id.is_a?(String)
    rescue
      id = nil
    end

    if id.present?
      @events[id] ||= generate(@@db.collection("events_#{account_id}").find({_id: id}).first)
    end
  end


  @@map_seven_day_blocks = "function() { var ts = this.ts; ts.setHours(0, 0, 0, 0); emit(ts.getTime(), {count: 1}); }"

  @@reduce_seven_day_blocks =
      "function(key, values) { " +
        "var sum = 0; " +
        "values.forEach(function(f) { " +
          " sum += f.count; " +
        "}); " +
        "return {count: sum};" +
      "};"

  def seven_day_blocks(account_id)
    blocks = @@db.collection("analytics_#{account_id}")
      .map_reduce(@@map_seven_day_blocks, @@reduce_seven_day_blocks, {:raw => true, 'out' => {'inline' => true}, 'query' => {'ts' => {'$gt' => 7.days.ago.utc.at_beginning_of_day}, 'd.e' => _id}})

    blocks
  end

  private

  def self.generate(params)
    return nil if (params.nil? or params["type"].nil?)
    type = params["type"].to_i
    params = {"event" => params}
    case type
      when 0
        UrlEvent.build(params)
      else
        raise "Unknown type: #{type}"
    end
  end
end
