package com.edatalia.webforms.presentation

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.print.PdfConverter
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.net.toUri
import com.edatalia.webforms.domain.Constants
import java.io.File
import java.util.UUID

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebFormsSdkLauncherScreen(uri: Uri) {
    val context = LocalContext.current as Activity
    var jsonFormsString: String? = null
    LaunchedEffect(Unit) {
        val jsonBytes = context.contentResolver.openInputStream(uri).use {
            it?.readBytes()
        }
        jsonFormsString = jsonBytes?.decodeToString()
        if (jsonFormsString == null) {
            val resultIntent = Intent()
            resultIntent.putExtra(
                Constants.RESPONSE_ERROR_STRING,
                "Input not valid"
            )
            context.setResult(ComponentActivity.RESULT_FIRST_USER, resultIntent)
            context.finish()
            return@LaunchedEffect
        }
    }
    AndroidView(
        factory = { WebView(context) },
        update = {
            it.apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccessFromFileURLs = true
                addJavascriptInterface(object {
                    @JavascriptInterface
                    fun postMessage(formHtml: String) {
                        try {
                            val converter = PdfConverter.getInstance()
                            val file = File(
                                context.getExternalFilesDir(null),
                                "${UUID.randomUUID()}.pdf"
                            )
                            converter.convert(context, formHtml, file)
                            val resultIntent = Intent()
                            resultIntent.putExtra(Constants.RESPONSE_URI_STRING, file.toUri().toString())
                            context.setResult(ComponentActivity.RESULT_OK, resultIntent)
                            context.finish()
                            return
                        } catch (exception: Exception) {
                            val resultIntent = Intent()
                            resultIntent.putExtra(
                                Constants.RESPONSE_ERROR_STRING,
                                exception
                            )
                            context.setResult(ComponentActivity.RESULT_FIRST_USER, resultIntent)
                            context.finish()
                            return
                        }
                    }
                }, Constants.JS_CALLBACK_INTERFACE)
                loadUrl(Constants.ASSETS_INDEX_HTML)
                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        val jsExpresionToConvert =
                            "jsonForms.init($jsonFormsString, (result) => { ${Constants.JS_CALLBACK_INTERFACE}.postMessage(result); })"
                        evaluateJavascript(jsExpresionToConvert, null)
                    }
                }
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}
