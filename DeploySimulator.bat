cls
call "\Program Files\Research In Motion\BlackBerry 10 WebWorks SDK 1.0.4.7\bbwp.bat" C:\projects\EventCinema.Blackberry\Trunk\EventCinema.Blackberry\EventCinema.Blackberry -d -o C:\temp\EventCinema.Blackberry
"\Program Files\Research In Motion\BlackBerry 10 WebWorks SDK 1.0.4.7\dependencies\tools\bin\blackberry-deploy" -installApp -device 192.168.158.128 -package C:\temp\EventCinema.Blackberry\simulator\EventCinema.Blackberry.bar
