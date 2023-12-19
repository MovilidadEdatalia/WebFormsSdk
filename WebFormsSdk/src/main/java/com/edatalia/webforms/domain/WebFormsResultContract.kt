package com.edatalia.webforms.domain

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.activity.result.contract.ActivityResultContract
import com.edatalia.webforms.data.WebFormsSdkIntentResult
import com.edatalia.webforms.presentation.WebFormsSdkLauncher

class WebFormsResultContract: ActivityResultContract<String, WebFormsSdkIntentResult>() {

    override fun createIntent(context: Context, input: String): Intent {
        val intent = Intent(context, WebFormsSdkLauncher::class.java)
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        intent.putExtra(Constants.INPUT_URI_STRING, input)
        return intent
    }

    override fun parseResult(resultCode: Int, intent: Intent?): WebFormsSdkIntentResult {
        if (resultCode == Activity.RESULT_OK) {
            val uriString =
                intent?.getStringExtra(Constants.RESPONSE_URI_STRING)
            val jsonString = intent?.getStringExtra(Constants.RESPONSE_JSON_STRING)
            return WebFormsSdkIntentResult(responseUriString = Uri.parse(uriString), responseJsonString = jsonString)
        } else if (resultCode == Activity.RESULT_FIRST_USER) {
            val error =
                intent?.getStringExtra(Constants.RESPONSE_ERROR_STRING)
            return WebFormsSdkIntentResult(error = error)
        } else if (resultCode == Constants.RESPONSE_REJECT_CODE) {
            return WebFormsSdkIntentResult(rejected = true)
        } else {
            return WebFormsSdkIntentResult()
        }
    }
}