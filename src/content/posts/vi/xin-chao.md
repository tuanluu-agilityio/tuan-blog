---
title: Bốn phút im lặng
description: "Hồ sơ AB#696969: một vụ án đã khép lại"
pubDate: 2026-11-26
lang: vi
translationKey: bon-phut-im-lang
draft: false
---
## I. Lời khai đầu tiên

Vụ án đến vào lúc 12 giờ 27 trưa, ngày 26 tháng 11, giống như mọi vụ án tồi tệ khác: bằng một câu thoại cụt lủn.

> *Extract Failed. SSRS report (/MenuReports/StandardReports/v_69_69/PFMNHoldingsExportForArc) request timed out after 60 minutes.*

Người cộng sự ngồi xuống bên kia bàn. Anh đã theo vụ này nhiều ngày, và anh đã có sẵn một nghi phạm.

"Là thủ tục `gp_ProcessPFMNPhunHauDinDataForArcExportByCriteria`," anh nói. "Nó dùng XPath. Trước đây nó chạy mất 45 phút. Tôi đã viết lại bằng temp table, giờ chỉ còn một phút."

"Vậy mà người chết vẫn chết," tôi nói.

"Vẫn chết." Anh đặt lên bàn một chi tiết làm tôi nổi da gà. "Với 92,521 dòng, export thành công. Với 92,522 dòng, export chết."

Một dòng. Chỉ một dòng giữa sự sống và cái chết.

Trong nghề này, tôi học được một điều: **khi một dòng quyết định số phận, hoặc dòng đó là kẻ sát nhân, hoặc chúng ta đang bị lừa.**

---

## II. Hiện trường

Tôi không tin lời khai. Tôi tin dấu vết.

Tôi lần theo đường đi của một request, từ màn hình người dùng xuống tận đáy. UI gọi Gateway. Gateway gọi `RiportService`. Ở đó, trong `PhunHaudingSoVitBit.cs`, tôi tìm thấy điều đầu tiên đáng chú ý: request không chờ kết quả. Nó tạo một `Thread` mới, trả lời "Âu pút rì quếch súp mít tịt sớt sếch phun ly" ngay, rồi bỏ đi.

Thread đó một mình đi gặp SSRS. Nó gửi một HTTP POST duy nhất, rồi ngồi chờ file Excel.

Còn `GetAuputKiuBayUser`, cái tên xuất hiện trong lời khai ban đầu, hóa ra chỉ là **người đưa tin**. Nó đọc lại lời trăng trối mà thread đã ghi vào bảng `AuputKiu`. Nó không giết ai. Nó chỉ thuật lại.

Tôi lật tiếp sang `SSRSEngine.cs`, và thấy dòng chữ của chính hung khí:

```csharp
httpClient.Timeout = TimeSpan.FromMinutes(60);
```

Sáu mươi phút. Nạn nhân đã chờ suốt một giờ trước khi gục xuống.

"Câu hỏi không phải là *ai* làm nó chậm," tôi nói với người cộng sự. "Câu hỏi là: *nó đã chờ cái gì* trong suốt một giờ đó?"

---

## III. Nghi phạm thứ nhất: Gã khổng lồ chậm chạp

Giả thuyết đầu tiên của tôi nghe rất hợp lý. Report `PFMNHaudingExportForArc.rdl` có **213 cột**. Nhân với 92,522 dòng, ta được gần **20 triệu ô Excel**. SSRS phải dựng từng ô một. Tôi tưởng tượng ra một gã khổng lồ lê bước, mỗi dòng nặng hơn một chút, cho đến khi vượt qua vạch 60 phút.

Tôi viết báo cáo đầu tiên và tự tin đặt tên cho nghi phạm.

Rồi người cộng sự hỏi một câu đơn giản:

"Nhưng lần chạy 92,521 dòng chỉ mất **5 phút**. File 85 MB. Vậy tại sao thêm một dòng lại thành hơn 60 phút?"

Tôi im lặng rất lâu.

Một gã khổng lồ chậm chạp không thể mất 5 phút cho 92,521 bước, rồi 60 phút cho bước tiếp theo. Đó không phải là sự chậm dần. **Đó là một vách đá.**

Nghi phạm thứ nhất có chứng cứ ngoại phạm. Tôi gạch tên hắn.

---

## IV. Nghi phạm thứ hai: Bức tường vô hình

Nếu là vách đá, phải có một bức tường. Trong thế giới .NET, có những bức tường mà ai cũng sợ: **2,147,483,647 byte**, giới hạn của `Int32.MaxValue`, và **4 GiB** của file ZIP khi không có Zip64.

85 MB chỉ là kích thước sau khi nén. Bên trong file XLSX, phần XML chưa nén có thể lớn hơn hai mươi lần. Tôi đoán nó đang đứng sát mép bức tường 2 GiB, và dòng thứ 92,522 đã đẩy nó qua.

Tôi đưa cho người cộng sự một đoạn PowerShell để mở bụng file XLSX. Kết quả trả về:

```
xl/worksheets/sheet1.xml   1163153849   87294569
```

**1.08 GiB.** Còn cách bức tường gần một nửa. Mỗi dòng chỉ thêm khoảng 12.5 KB. Không bức tường nào sụp vì 12.5 KB.

Nghi phạm thứ hai cũng có chứng cứ ngoại phạm.

Đến lúc này, tôi bắt đầu nghi ngờ chính dòng 92,522. Có thể nó mang trong mình một ký tự độc, hoặc một chuỗi dài vô tận làm renderer của SSRS treo cứng. Tôi soạn một kế hoạch để cô lập nó: lấy dòng 92,000 đến 93,000, kiểm tra từng ô, tìm ký tự điều khiển, tìm chuỗi dài hơn 32,767 ký tự.

Tôi đã chuẩn bị bẫy cho kẻ đầu độc. Nhưng kẻ đầu độc không bao giờ xuất hiện.

---

## V. Nhân chứng không biết nói dối

Rồi người cộng sự mang về thứ mà lẽ ra chúng tôi phải xem đầu tiên: `RiportServer.dbo.ExecutionLog3`, cuốn nhật ký của chính SSRS.

Tôi đọc nó như đọc một bản khai dưới lời thề.

```
TotalSec  DataSec  RenderSec  ByteCount  RowCount  Status
280       31       226        87299593   92521     rsSuccess
275       41       213        0          92521     rsHttpRuntimeClientDisconnectionError
289       41       226        0          92522     rsHttpRuntimeClientDisconnectionError
```

Hãy nhìn kỹ dòng thứ hai.

**92,521 dòng. Thất bại.**

Chính con số được cho là "an toàn" cũng đã từng chết. Ranh giới một dòng chưa bao giờ tồn tại. Nó chỉ là một sự trùng hợp, một ảo ảnh dựng lên từ hai lần chạy may rủi.

Và cuốn nhật ký còn nói nhiều hơn thế:

- SSRS **không chậm**. Nó render xong mọi lần chạy trong dưới 6 phút.
- Thủ tục **không có tội**. Phần lấy dữ liệu chỉ mất 31 đến 47 giây. Bản tuning của người cộng sự hoạt động hoàn hảo.
- Ở những lần thất bại, `ByteCount = 0`, kèm trạng thái `rsHttpRuntimeClientDisconnectionError`.

SSRS đã làm xong việc. Nó cầm file Excel trên tay, quay lại để trao cho người đã gọi nó, **và người đó đã biến mất.**

Nhưng kỳ lạ thay, phía Riport-service không biết mình đã biến mất. Nó vẫn ngồi đó, vẫn cầm ống nghe, vẫn chờ, suốt 60 phút, trên một đường dây đã chết từ lâu.

Đây không còn là vụ án về dữ liệu. **Đây là một vụ bắt cóc trên đường truyền.**

---

## VI. Quy luật của đồng hồ

Tôi yêu cầu thêm một cột nữa: `InstanceName`. Có thể chỉ một trong hai máy chủ SSRS bị bệnh.

Kết quả loại bỏ giả thuyết đó. Cả `VMSSIS-696901` lẫn `VMSSIS-696902` đều có lần sống, có lần chết. Nhưng khi xếp mọi lần chạy theo thời gian, một quy luật hiện ra lạnh lùng như mặt đồng hồ:

- Mọi request **≤ 231 giây**: sống.
- Mọi request **≥ 297 giây**: chết.
- Ở giữa, từ 268 đến 282 giây, là vùng chạng vạng: lúc sống, lúc chết.

Thủ phạm không đếm dòng. **Thủ phạm đếm giây.** Và nó bắt đầu ra tay ở khoảng bốn phút rưỡi.

Người cộng sự thử cách tạm thời mà tôi đề nghị: `ExtractPerFundGroup = true`, chia export thành nhiều phần nhỏ. Sáu báo cáo. **Cả sáu đều sống.** Mỗi phần đủ ngắn để chạy thoát trước khi đồng hồ điểm.

---

## VII. Lời trăng trối trong log

Người cộng sự tìm được một người có quyền vào máy chủ. Từ `E:\Program Files\Microsoft SQL Server Reporting Services\SSRS\LogFiles`, chúng tôi nhận được lời trăng trối nguyên văn của SSRS:

```
00:14:20  RenderForNewSession('/ArcReports/.../PFMNHaudingExportForArc')
00:15:01  (dữ liệu đã lấy xong)
00:19:07  ReportServerHttpRuntimeClientDisconnectionException
          System.Runtime.InteropServices.COMException:
          This network connection does not exist. (0x800708CA)
             at RsWorkerRequest.FlushResponse(...)
```

*This network connection does not exist.*

Không phải "bị từ chối". Không phải "hết thời gian". Mà là **không tồn tại**. Khi SSRS mở miệng nói câu đầu tiên, sau 287 giây, đường dây đã bị cắt từ trước đó.

Ai đó, ở đâu đó giữa pod trên AKS và máy chủ SSRS, đã lặng lẽ cắt sợi dây trong lúc hai bên im lặng chờ nhau. Và kẻ đó cắt rất khéo: nó không để lại dấu vết cho phía Riport-service. Không có tín hiệu reset. Không có lời từ biệt. Chỉ có sự im lặng kéo dài sáu mươi phút.

---

## VIII. Những cánh cửa đóng

Đến đây, cuộc điều tra rơi vào giai đoạn khó nhất: biết có hung thủ, nhưng không được vào nhà.

- Tôi cần **HTTPERR log** trên VM. Câu lệnh trả về trống không.
- Tôi đề nghị gọi SSRS trực tiếp bằng `curl` để so sánh có và không có TCP keepalive. Kết quả: **HTTP 401**. Cánh cửa xác thực đóng sập trước mặt.
- Tôi đề nghị **Event Log**: Security 5156, Firewall log. Nhưng người cộng sự không có quyền vào VM.
- Rồi đến một ràng buộc mới: **bắt buộc dùng SSRS**. Hướng sửa trong code mà tôi đề xuất, tạo XLSX trực tiếp trong Services, bị bác bỏ ngay.

Có những lúc trong nghề này, bạn phải dừng lại và hỏi một câu khác.

"Anh có quyền đọc gì trên Azure Portal?"

---

## IX. Kẻ đứng giữa

Tôi vẽ lại đường đi của sợi dây:

> **Pod riport-service** → Istio sidecar → mạng AKS → **internal Load Balancer `lat-balance-at-rep-001`** (69.69.69.69) → máy chủ RSIS

Tôi đặt một danh sách việc trước mặt người cộng sự, và đặt bước đầu tiên lên trên cùng, vì nó rẻ nhất và đáng giá nhất:

> *Load balancers → `lat-balance-at-rep-001` → Load balancing rules. Xem Idle timeout và TCP reset.*

Vài phút sau, câu trả lời đến. Ngắn gọn như một bản án:

> **Idle timeout: 4 phút. Enable TCP Reset: Unchecked.**

Đó là nó.

Bốn phút. Đó là quãng thời gian mà Load Balancer cho phép một kết nối im lặng. SSRS cần khoảng 4 đến 5 phút để render xong một export lớn, mà trong lúc render, nó không gửi đi một byte nào. Đến phút thứ tư, Load Balancer coi kết nối đã chết và xóa nó khỏi bộ nhớ. TCP reset bị tắt, nên nó làm việc đó **trong im lặng tuyệt đối**: không báo cho SSRS, không báo cho Riport-service.

SSRS chỉ phát hiện ra khi nó cầm file Excel quay lại: `0x800708CA`. Riport-service thì không bao giờ phát hiện ra: nó chờ cho đến khi chính đồng hồ 60 phút của mình hết giờ.

Còn vùng chạng vạng từ 268 đến 282 giây? Đồng hồ bốn phút không đếm từ lúc request bắt đầu, mà đếm đến **byte đầu tiên của response**, một mốc thời gian mà `ExecutionLog3` không ghi lại. Đồng hồ không sai. Chỉ là nhân chứng không nhìn thấy kim giây.

---

## X. Mệnh lệnh không bao giờ được thực thi

Nhưng câu chuyện có một khúc quanh cuối cùng, và đó là phần làm tôi lạnh gáy nhất.

Tôi mở `locals_lat_balance_so.tf` trong repo `Aure-Infra-Te-ra-phom`:

```hcl
"rule-etetayet-443" = {
  ...
  idle_timeout_in_minutes = 60
}
```

**Sáu mươi phút.** Được viết từ ngày 8 tháng 10, trong commit `69b69b69`, với tiêu đề không thể rõ ràng hơn: *"Set AtRet staging and production LB idle timeouts to 60 minutes."*

Ai đó đã biết. Ai đó đã sửa. Mệnh lệnh đã được viết ra, ký tên, lưu vào hồ sơ.

**Nhưng nó chưa bao giờ đến được hiện trường.**

Trên giấy, Load Balancer chờ 60 phút. Ngoài đời thật, nó chỉ chờ 4 phút. Và trong khoảng cách giữa giấy và đời thật ấy, suốt bảy tuần, mọi export lớn đều lặng lẽ chết.

Tôi lần tiếp đến pipeline deploy: Harness `cede_in_pho_ra_so_trat_to`. Đó là một pipeline **chạy tay**, không có trigger, với `tf_nhanh` do người chạy tự nhập. Sau ngày 8 tháng 10, file `khachhang.tfvars` đã được sửa ít nhất ba lần nữa. Bất kỳ lần plan nào từ `main` cũng phải hiện ra dòng `4 -> 60`. Vậy mà nó vẫn là 4.

Vì sao? Câu trả lời nằm trong lịch sử thực thi của một Harness project mà chúng tôi không có quyền vào. Hồ sơ phần này vẫn để ngỏ.

---

## XI. Kết án

Người cộng sự vào Azure Portal, đổi idle timeout thành **60 phút**, đúng như Terraform đã ra lệnh từ bảy tuần trước. TCP reset vẫn để tắt, cũng đúng như Terraform. Không một dòng code nào bị thay đổi.

Rồi anh chạy lại export, lần này không chia nhỏ, toàn bộ khối dữ liệu từng giết chết mọi lần chạy trước.

**Success.**

---

## Ghi chú cuối hồ sơ

Tôi khép hồ sơ lại với vài điều muốn nhớ:

1. **Kẻ hét lên "timeout" hiếm khi là hung thủ.** `GetAuputKiuBayUser` chỉ là người đưa tin. `HttpClient` chỉ là nạn nhân chờ đợi quá lâu.
2. **Một ranh giới một dòng thường là một chiếc đồng hồ đội lốt.** 92,521 và 92,522 chưa bao giờ là con số quan trọng. Thời gian mới là con số quan trọng.
3. **Thủ tục bị nghi oan.** Bản tuning hoạt động tốt. Nó chỉ không thể chống lại một kẻ thù nằm ngoài database.
4. **Hãy hỏi nhân chứng trực tiếp trước.** `ExecutionLog3` đã ghi lại sự thật ngay từ đầu: `rsHttpRuntimeClientDisconnectionError`, `ByteCount = 0`. Nếu đọc nó sớm hơn, chúng tôi đã tiết kiệm được ba nghi phạm sai.
5. **Giấy tờ không phải là hiện trường.** Terraform nói 60 phút. Azure nói 4. Chỉ một trong hai là sự thật, và người dùng sống trong sự thật đó.

Ngoài kia vẫn còn những Load Balancer chưa được kiểm tra: `lat-pay-lon-so-prd-6969-01`, `lat-pay-lon-so-prd-6969-02`. Ticket ZD629939 đến từ một khách hàng thật.

Có thể ở đâu đó, ngay lúc này, một đồng hồ bốn phút khác vẫn đang lặng lẽ đếm.

*Hồ sơ AB#696969: đã khép tại Staging. Production: chưa điều tra.*