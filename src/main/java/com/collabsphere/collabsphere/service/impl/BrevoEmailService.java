package com.collabsphere.collabsphere.service.impl;

import com.collabsphere.collabsphere.config.BrevoConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BrevoEmailService {

    private final BrevoConfig brevoConfig;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendEmail(
            String to,
            String toName,
            String subject,
            String htmlContent
    ) {

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);

        // IMPORTANT: Brevo uses api-key header
        headers.set("api-key", brevoConfig.getApiKey());

        Map<String, Object> body = Map.of(

                "sender", Map.of(
                        "name", "CollabSphere",
                        "email", "surarshi006@gmail.com"
                ),

                "to", List.of(
                        Map.of(
                                "email", to,
                                "name", toName
                        )
                ),

                "subject", subject,

                "htmlContent", htmlContent

        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        restTemplate.postForEntity(
                "https://api.brevo.com/v3/smtp/email",
                request,
                String.class
        );
    }
}