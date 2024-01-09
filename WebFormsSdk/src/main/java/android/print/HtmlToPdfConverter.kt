package android.print

import android.content.Context
import android.os.Handler
import android.os.ParcelFileDescriptor
import android.util.Log
import android.webkit.WebView
import android.webkit.WebViewClient
import java.io.File

/**
 * Converts HTML to PDF.
 *
 *
 * Can convert only one task at a time, any requests to do more conversions before
 * ending the current task are ignored.
 */
class HtmlToPdfConverter private constructor() : Runnable {
    private var mContext: Context? = null
    private var mHtmlString: String? = null
    private var mPdfFile: File? = null
    private var mPdfPrintAttrs: PrintAttributes? = null
    private var mIsCurrentlyConverting = false
    private var mWebView: WebView? = null
    private var mCallback: () -> Unit = {}
    override fun run() {
        mWebView = WebView(mContext!!)
        mWebView!!.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView, url: String) {
                val documentAdapter = mWebView!!.createPrintDocumentAdapter()
                documentAdapter.onLayout(null,
                    pdfPrintAttrs,
                    null,
                    object : PrintDocumentAdapter.LayoutResultCallback() {},
                    null
                )
                documentAdapter.onWrite(
                    arrayOf<PageRange>(PageRange.ALL_PAGES),
                    outputFileDescriptor,
                    null,
                    object : PrintDocumentAdapter.WriteResultCallback() {
                        override fun onWriteFinished(pages: Array<PageRange>) {
                            mCallback()
                            destroy()
                        }
                    })
            }
        }
        mWebView!!.loadData(mHtmlString!!, "text/html", "UTF-8")
    }

    var pdfPrintAttrs: PrintAttributes?
        get() = if (mPdfPrintAttrs != null) mPdfPrintAttrs else defaultPrintAttrs
        set(printAttrs) {
            mPdfPrintAttrs = printAttrs
        }

    fun convert(context: Context?, htmlString: String?, file: File?, callback: () -> Unit) {
        requireNotNull(context) { "context can't be null" }
        requireNotNull(htmlString) { "htmlString can't be null" }
        requireNotNull(file) { "file can't be null" }
        if (mIsCurrentlyConverting) return
        mContext = context
        mHtmlString = htmlString
        mPdfFile = file
        mIsCurrentlyConverting = true
        mCallback = callback
        runOnUiThread(this)
    }

    private val outputFileDescriptor: ParcelFileDescriptor?
        get() {
            try {
                mPdfFile!!.createNewFile()
                return ParcelFileDescriptor.open(
                    mPdfFile,
                    ParcelFileDescriptor.MODE_TRUNCATE or ParcelFileDescriptor.MODE_READ_WRITE
                )
            } catch (e: Exception) {
                Log.d(TAG, "Failed to open ParcelFileDescriptor", e)
            }
            return null
        }
    private val defaultPrintAttrs: PrintAttributes
        get() = PrintAttributes.Builder()
            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
            .setResolution(PrintAttributes.Resolution("RESOLUTION_ID", "RESOLUTION_ID", 600, 600))
            .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
            .build()

    private fun runOnUiThread(runnable: Runnable) {
        val handler = Handler(mContext!!.mainLooper)
        handler.post(runnable)
    }

    private fun destroy() {
        mContext = null
        mHtmlString = null
        mPdfFile = null
        mPdfPrintAttrs = null
        mIsCurrentlyConverting = false
        mWebView = null
    }

    companion object {
        private const val TAG = "PdfConverter"
        private var sInstance: HtmlToPdfConverter? = null

        @get:Synchronized
        val instance: HtmlToPdfConverter
            get() {
                if (sInstance == null) sInstance = HtmlToPdfConverter()
                return sInstance!!
            }
    }
}