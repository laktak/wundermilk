#!/usr/bin/env node

var fs=require("fs");
var path=require("path");
var icalToolkit=require("ical-toolkit");

var args=(function() {
  return process.argv.slice(2).reduce(function(args, x) {
    if (x[0]==="-") { var i=x.indexOf("="); args[x.substr(1, i>0?i-1:undefined)]=i>0?x.substr(i+1):true; }
    else args.params.push(x);
    return args;
  }, { params: [] });
})();

function convert(wuPath, rtmPath, wuPath2) {

  var icsText=fs.readFileSync(rtmPath, "utf8");
  var data=JSON.parse(fs.readFileSync(wuPath, "utf8"));

  var user=data.user;
  var lists={};
  data.data.lists.forEach(x=> {
    lists[x.title.toLowerCase()]=x.id;
  });
  console.log("Converting the following tags to lists: "+Object.keys(lists).join(", "));

  function mkTime(str) {
    if (str) return str.substr(0, 4)+"-"+str.substr(4, 2)+"-"+str.substr(6, 2);
    else return null;
  }

  var reminders=[], tasks=[], notes=[];
  var id=1200000001, rid=80000001;

  icalToolkit.parseToJSON(icsText, function (err, json) {
    if (err) throw err;

    var todo=json.VCALENDAR[0].VTODO;
    todo.forEach(x => {

      var title=x.SUMMARY;
      var desc=x.DESCRIPTION; // 'Time estimate: none\\nTags: none\\nLocation: none\\n\\n',
      var prio=x.PRIORITY; // 1-3
      var due=x["DUE;VALUE=DATE"];
      var repeat=x.RRULE; // FREQ=DAILY;INTERVAL=4

      if (x.STATUS==="COMPLETED") return;
      desc=desc.split("\\n");
      var tags=desc[1].substr(6).split("\\, ");

      var freq=(/FREQ=([^;]*)/.exec(repeat)||[0,""])[1];
      var interval=(/INTERVAL=([^;]*)/.exec(repeat)||[0,1])[1];

      var listId=lists["inbox"];
      tags.forEach((x, i) => {
        if (lists[x]) {
          listId=lists[x];
          tags.splice(i, 1);
        }
      });

      tags.forEach((x) => { title+=" #"+x; });

      var reminder;
      var add={
        "completed": false,
        "created_by_id": user,
        "id": id,
        "list_id": listId,
        "revision": 1,
        "starred": false,
        "title": title,
        "type": "task"
      };

      if (due) {
        add.due_date=mkTime(due);
        reminder={
          "date": mkTime(due)+"T07:00:00.000Z",
          "id": rid++,
          "revision": 1,
          "task_id": id,
          "type": "reminder",
        };
      }

      // check dups
      if (!args.nodup && data.data.tasks.find(x => x.title===add.title && x.due_date==add.due_date && x.list_id===add.list_id))
        return;

      id++;

      if (freq) {
        add.recurrence_count=parseInt(interval, 10);
        switch (freq) {
          case "YEARLY": add.recurrence_type="year"; break;
          case "MONTHLY": add.recurrence_type="month"; break;
          case "WEEKLY": add.recurrence_type="week"; break;
          case "DAILY": add.recurrence_type="day"; break;
          default: throw new Error(freq);
        }
      }

      if (desc[4]==="---") {
        console.log(desc);
        desc=desc.slice(5).join("\n");
        var note= {
          "content": desc,
          "id": rid++,
          "revision": 1,
          "task_id": id,
          "type": "note"
        };
        notes.push(note);
      }

      tasks.push(add);
      if (reminder) reminders.push(reminder);
    });

    data.data.tasks=tasks;
    data.data.notes=notes;
    data.data.reminders=reminders;
    data.data.subtasks=[];
    data.data.task_positions=[];
    data.data.subtask_positions=[];
    fs.writeFileSync(wuPath2, JSON.stringify(data), "utf8");

    console.log("Found "+tasks.length+" open tasks");
    Object.keys(lists).forEach(name=> {
      var list=tasks.filter(x => x.list_id===lists[name]);
      console.log(name+" ("+list.length+")");
      list.forEach(x => console.log(" - "+x.title));
    });
  });

}


if (args.params.length<3) {
  console.log("usage: wundermilk [options] WUNDERLIST-IN ICS-IN WUNDERLIST-OUT");
  console.log("The options are as follows:");
  console.log("-nodup  do not check for duplicates");
} else {
  convert.apply(null, args.params);
}
