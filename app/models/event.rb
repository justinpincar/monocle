class Event
  attr_accessor :_id, :display, :type, :c_at, :u_at

  def self.build(event, params={})
    event_params = params[:event]

    event.type = event_params[:type].to_i
    event.display = event_params[:display]
    event
  end

  def save(account_id)
    now = Time.now

    if self._id.nil?
      self._id = BSON::ObjectId.new
      @@db.collection("events_#{account_id}").insert({_id: _id, display: display, type: type, c_at: now, u_at: now})
    else
      @@db.collection("events_#{account_id}").update({_id: _id}, {display: display, type: type, u_at: now})
    end
  end

  def self.all(account_id)
    @@db.collection("events_#{account_id}").find()
  end

  def self.find(account_id, id)
    @@db.collection("events_#{account_id}").find({_id: BSON::ObjectId.from_string(id)}).first
  end
end
