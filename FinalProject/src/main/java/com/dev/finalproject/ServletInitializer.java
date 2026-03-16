package com.dev.finalproject;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

// war bootstrap
public class ServletInitializer extends SpringBootServletInitializer {

	@Override
	// war config
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(FinalProjectApplication.class);
	}

}
