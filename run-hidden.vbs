' Launches the agent with no console window.
' Task Scheduler runs this through wscript.exe, which has no window of its own,
' and Run with a window style of 0 keeps node's console hidden too.
Option Explicit
Dim shell, fso, here, node, cmd
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
here = fso.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = here
node = "C:\Program Files\nodejs\node.exe"
cmd = """" & node & """ agent.js --once --key ""..\technocore-private-key.json"""
WScript.Quit shell.Run(cmd, 0, True)
