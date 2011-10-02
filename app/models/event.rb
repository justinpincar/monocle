class Event
  attr_accessor :_id, :display, :type, :c_at, :u_at

  def self.build(event, params={})
    event_params = params["event"]

    event._id = event_params["_id"] if event_params["_id"].present?
    event.type = event_params["type"].to_i if event_params["type"].present?
    event.display = event_params["display"] if event_params["display"].present?
    event.c_at = event_params["c_at"] if event_params["c_at"].present?
    event.u_at = event_params["u_at"] if event_params["u_at"].present?
    event
  end

  def update(params={})
    self.type = params["type"].to_i if params["type"].present?
    self.display = params["display"] if params["display"].present?
  end

  def save(account_id)
    now = Time.now

    if self._id.nil?
      self._id = BSON::ObjectId.new
      @@db.collection("events_#{account_id}").insert({_id: _id, display: display, type: type, c_at: now, u_at: now})
    else
      @@db.collection("events_#{account_id}").update({_id: _id},  {"$set" => {display: display, type: type, u_at: now}})
    end
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
    id = BSON::ObjectId.from_string(id) if id.is_a?(String)
    @events[id] ||= generate(@@db.collection("events_#{account_id}").find({_id: id}).first)
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
