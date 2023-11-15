package com.edatalia.webforms.data

import android.net.Uri

data class WebFormsSdkIntentResult @JvmOverloads constructor(val responseUriString: Uri? = null, val error: String? = null)