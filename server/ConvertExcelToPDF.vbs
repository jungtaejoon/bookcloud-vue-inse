if WScript.Arguments.Count < 2 Then
    WScript.Echo "Usage: cscript ConvertExcelToPDF.vbs <ExcelFilePath> <PDFFilePath>"
    WScript.Quit 1
End If

Dim excelFilePath, pdfFilePath
excelFilePath = WScript.Arguments(0)
pdfFilePath = WScript.Arguments(1)

Dim excelApp, workbook, worksheet
Set excelApp = CreateObject("Excel.Application")

On Error Resume Next
Set workbook = excelApp.Workbooks.Open(excelFilePath)

If Err.Number <> 0 Then
    WScript.Echo "Failed to open Excel file: " & Err.Description
    WScript.Quit 1
End If

On Error GoTo 0

' 첫 번째 워크시트 선택
Set worksheet = workbook.Worksheets(1)

' 페이지 설정: 모든 내용을 한 페이지에 맞추도록 조정
With worksheet.PageSetup
    .Zoom = False
    .FitToPagesWide = 1
    .FitToPagesTall = False ' 행 수에 맞추지 않음 (길이 제한 없음)
End With

' PDF로 변환
workbook.ExportAsFixedFormat 0, pdfFilePath

workbook.Close False
excelApp.Quit
