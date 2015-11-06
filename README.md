# wundermilk

Wundermilk can convert your tasks from RTM (remember the milk) to Wunderlist.

Unfortunately RTM does not provide a good way to export you tasks so this method is not quite straightforward.

## Step 1

Go to https://www.wunderlist.com in your favorite browser.

Create any lists you want to use (probably the same as in RTM to keep it simple).

Finally, click on the icon next to your name and then `Account settings`, click on `Create Backup` and then download the JSON file.

If you are worried that I'm not giving you the instructions to convert **to Wunderlist**, keep in mind that I said it's not straightforward.

## Step 2

Open https://www.rememberthemilk.com/app

RTM can export your tasks as an ical file but it will be missing your lists.

To keep your lists go to each list, click on "select all" and then add a tag with the name of the list (it should match the name you created in wunderlist).

Finally, go to http://www.rememberthemilk.com/icalendar/YOURUSERNAME (replace `YOURUSERNAME` with your username) and download the ics file.

## Step 3

Install wundermilk: `npm i wundermilk -g`

Convert your tasks from ICS to the Wunderlist JSON format:

```
wundermilk WUNDERLIST-IN ICS-IN WUNDERLIST-OUT
```

- WUNDERLIST-IN: File downloaded in step 1
- ICS-IN: File downloaded in step 2
- WUNDERLIST-OUT: new JSON file (e.g. converted.json)

wundermilk will report the tasks it found:

```
Converting the following tags to lists: inbox, futures, work, misc
Found 26 open tasks
inbox (3)
 - world domination
 - just kidding
 - really
futures (17)
[..]
```

## Step 4

Go to https://www.wunderlist.com, again in your favorite browser.

Click on the icon next to your name and then `Account settings`, click on `Import Backup Data` and specify the file you just created (eg. converted.json).

Your tasks should now be visible in Wunderlist. You will have to clean up any duplicate folders manually (that's just how the import works).

## Step 5

You are on you own now. Have fun. Or complete some tasks.

## Step 6

OK, some final advice. I used this tool once, it worked for me but YMMV. If you find a problem please fix it yourself (PR).

Oh and sorry but I hardcoded the due time to 7:00Z :)
