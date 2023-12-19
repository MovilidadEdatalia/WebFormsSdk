package com.edatalia.webforms.data

import android.net.Uri

data class WebFormsSdkIntentResult @JvmOverloads constructor(
    val responseUriString: Uri? = null,
    val responseJsonString: String? = null,
    val rejected: Boolean = false,
    val error: String? = null
)